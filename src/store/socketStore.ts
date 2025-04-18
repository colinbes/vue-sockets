/**
 * Socket Store Module
 *
 * In full transparentcy, this file was created using cline with only minor edits on my side.
 *
 * This module provides a Pinia store for managing socket.io connections in the application.
 * It handles socket connection, disconnection, event emission, and event listening.
 *
 * The store uses Vue's Composition API with Pinia for state management
 * and leverages socket.io-client for WebSocket communication.
 */
import { defineStore } from 'pinia'
import { ref, computed, onUnmounted } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { io, Socket } from 'socket.io-client'

/**
 * Socket connection status enum
 */
export enum SocketStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error'
}

/**
 * Socket connection configuration interface
 */
export interface SocketConfig {
  url: string
  path?: string
  autoConnect: boolean
  reconnection: boolean
  reconnectionAttempts: number
  reconnectionDelay: number
  timeout: number
}

/**
 * Default socket configuration
 */
const DEFAULT_CONFIG: SocketConfig = {
  url: 'ws://localhost:3000',
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000
}

/**
 * Socket Store
 *
 * A Pinia store that manages socket.io connections for the application.
 * This store handles connecting, disconnecting, emitting events, and listening for events.
 */
export const useSocketStore = defineStore('socket', () => {
  // Socket instance
  const socket = ref<Socket | null>(null)

  // Socket connection status
  const status = ref<SocketStatus>(SocketStatus.DISCONNECTED)

  // Socket connection error message
  const errorMessage = ref<string | null>(null)

  // Socket configuration
  const configStorage = useLocalStorage('socket-config', DEFAULT_CONFIG)
  const config = ref<SocketConfig>({ ...configStorage.value })

  // Socket event listeners
  const listeners = ref<Map<string, Array<(...args: unknown[]) => void>>>(new Map())

  /**
   * Computed property that determines whether the socket is connected
   */
  const isConnected = computed(() => status.value === SocketStatus.CONNECTED)

  /**
   * Computed property that determines whether the socket is connecting
   */
  const isConnecting = computed(() => status.value === SocketStatus.CONNECTING)

  /**
   * Computed property that determines whether the socket is disconnected
   */
  const isDisconnected = computed(() => status.value === SocketStatus.DISCONNECTED)

  /**
   * Computed property that determines whether the socket has an error
   */
  const hasError = computed(() => status.value === SocketStatus.ERROR)

  /**
   * Updates the socket configuration
   *
   * @param newConfig - Partial socket configuration to update
   */
  const updateConfig = (newConfig: Partial<SocketConfig>) => {
    config.value = { ...config.value, ...newConfig }
    configStorage.value = { ...config.value }
  }

  /**
   * Connects to the socket server
   *
   * @param url - Optional URL to connect to (overrides config URL)
   * @returns Promise that resolves when connected or rejects with an error
   */
  const connect = (url?: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        // Disconnect existing socket if any
        if (socket.value) {
          disconnect()
        }

        // Update status
        status.value = SocketStatus.CONNECTING
        errorMessage.value = null

        // Create socket instance with websocket transport
        socket.value = io(url || config.value.url, {
          transports: ['websocket'],
          path: config.value.path,
          autoConnect: config.value.autoConnect,
          reconnection: config.value.reconnection,
          reconnectionAttempts: config.value.reconnectionAttempts,
          reconnectionDelay: config.value.reconnectionDelay,
          timeout: config.value.timeout
        })

        // Set up event listeners
        socket.value.on('connect', () => {
          status.value = SocketStatus.CONNECTED
          console.log('Socket connected')
          resolve()
        })

        socket.value.on('disconnect', (reason) => {
          status.value = SocketStatus.DISCONNECTED
          console.log(`Socket disconnected: ${reason}`)
        })

        socket.value.on('connect_error', (error) => {
          status.value = SocketStatus.ERROR
          errorMessage.value = error.message
          console.error('Socket connection error:', error)
          reject(error)
        })

        // Connect if not auto-connecting
        if (!config.value.autoConnect) {
          socket.value.connect()
        }
      } catch (error) {
        status.value = SocketStatus.ERROR
        errorMessage.value = error instanceof Error ? error.message : 'Unknown error'
        console.error('Socket connection error:', error)
        reject(error)
      }
    })
  }

  /**
   * Disconnects from the socket server
   */
  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
    }
    status.value = SocketStatus.DISCONNECTED
  }

  /**
   * Emits an event to the socket server
   *
   * @param event - Event name
   * @param data - Event data
   * @returns Promise that resolves with acknowledgement data or rejects with an error
   */
  const emit = <T = unknown>(event: string, data?: unknown): Promise<T> => {
    return new Promise((resolve, reject) => {
      if (!socket.value || !isConnected.value) {
        reject(new Error('Socket not connected'))
        return
      }

      socket.value.emit(event, data, (response: T) => {
        resolve(response)
      })
    })
  }

  /**
   * Registers an event listener
   *
   * @param event - Event name
   * @param callback - Event callback
   */
  const on = (event: string, callback: (...args: unknown[]) => void) => {
    if (!socket.value) {
      console.warn('Socket not initialized, listener will be registered when connected')
    }

    // Store listener in map for later cleanup
    if (!listeners.value.has(event)) {
      listeners.value.set(event, [])
    }
    listeners.value.get(event)?.push(callback)

    // Register listener with socket if connected
    if (socket.value) {
      socket.value.on(event, callback)
    }
  }

  /**
   * Removes an event listener
   *
   * @param event - Event name
   * @param callback - Event callback (optional, if not provided all listeners for the event are removed)
   */
  const off = (event: string, callback?: (...args: unknown[]) => void) => {
    if (!socket.value) {
      return
    }

    if (callback) {
      // Remove specific listener
      socket.value.off(event, callback)

      // Update listeners map
      const eventListeners = listeners.value.get(event)
      if (eventListeners) {
        const index = eventListeners.indexOf(callback)
        if (index !== -1) {
          eventListeners.splice(index, 1)
        }
        if (eventListeners.length === 0) {
          listeners.value.delete(event)
        } else {
          listeners.value.set(event, eventListeners)
        }
      }
    } else {
      // Remove all listeners for event
      socket.value.off(event)
      listeners.value.delete(event)
    }
  }

  /**
   * Removes all event listeners
   */
  const offAll = () => {
    if (!socket.value) {
      return
    }

    // Remove all listeners
    listeners.value.forEach((_, event) => {
      socket.value?.off(event)
    })
    listeners.value.clear()
  }

  /**
   * Resets the store to its initial state
   */
  const $reset = () => {
    disconnect()
    config.value = DEFAULT_CONFIG
    configStorage.value = DEFAULT_CONFIG
    status.value = SocketStatus.DISCONNECTED
    errorMessage.value = null
    listeners.value.clear()
  }

  // Clean up on component unmount
  onUnmounted(() => {
    disconnect()
  })

  /**
   * Expose the store's state and methods
   */
  return {
    socket,
    status,
    errorMessage,
    config,
    isConnected,
    isConnecting,
    isDisconnected,
    hasError,
    updateConfig,
    connect,
    disconnect,
    emit,
    on,
    off,
    offAll,
    $reset
  }
})
