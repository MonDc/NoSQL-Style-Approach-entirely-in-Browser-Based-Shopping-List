import { OperationResult } from '../types/shopping-list.types';

/**
 * Centralized error handling utility
 */
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: Array<{ timestamp: Date; error: Error; context?: any }> = [];

  private constructor() {}

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Handle and format errors consistently
   */
  public handleError<T>(error: unknown, defaultMessage: string): OperationResult<T> {
    const processedError = this.processError(error);
    
    this.logError(processedError, { defaultMessage });
    
    return {
      success: false,
      error: processedError,
      message: processedError.message || defaultMessage
    };
  }

  /**
   * Process different error types
   */
  private processError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }
    
    if (typeof error === 'string') {
      return new Error(error);
    }
    
    return new Error('An unknown error occurred');
  }

  /**
   * Log error for debugging
   */
  private logError(error: Error, context?: any): void {
    const entry = {
      timestamp: new Date(),
      error,
      context
    };
    
    this.errorLog.push(entry);
    console.error('[ErrorHandler]', error.message, context);
    
    // Keep log size manageable
    if (this.errorLog.length > 100) {
      this.errorLog.shift();
    }
  }

  /**
   * Log info for debugging
   */
  public logInfo(message: string, data?: any): void {
    console.log(`[Info] ${message}`, data || '');
  }

  /**
   * Get recent errors
   */
  public getRecentErrors(): Array<{ timestamp: Date; error: Error; context?: any }> {
    return [...this.errorLog];
  }

  /**
   * Clear error log
   */
  public clearErrorLog(): void {
    this.errorLog = [];
  }
}