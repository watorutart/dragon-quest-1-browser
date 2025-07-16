const InputHandler = require('../src/inputHandler.js');

describe('InputHandler', () => {
  let inputHandler;
  let mockCallback;

  beforeEach(() => {
    mockCallback = jest.fn();
    inputHandler = new InputHandler();
  });

  afterEach(() => {
    inputHandler.cleanup();
  });

  describe('constructor', () => {
    test('should create InputHandler instance', () => {
      expect(inputHandler).toBeInstanceOf(InputHandler);
    });

    test('should initialize with empty key states', () => {
      expect(inputHandler.isKeyPressed('ArrowUp')).toBe(false);
      expect(inputHandler.isKeyPressed('ArrowDown')).toBe(false);
      expect(inputHandler.isKeyPressed('ArrowLeft')).toBe(false);
      expect(inputHandler.isKeyPressed('ArrowRight')).toBe(false);
    });
  });

  describe('key event handling', () => {
    test('should detect arrow key press', () => {
      const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      document.dispatchEvent(keyEvent);
      
      expect(inputHandler.isKeyPressed('ArrowUp')).toBe(true);
    });

    test('should detect WASD key press', () => {
      const keyEvent = new KeyboardEvent('keydown', { key: 'w' });
      document.dispatchEvent(keyEvent);
      
      expect(inputHandler.isKeyPressed('w')).toBe(true);
    });

    test('should detect key release', () => {
      // Press key
      const keyDownEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      document.dispatchEvent(keyDownEvent);
      expect(inputHandler.isKeyPressed('ArrowUp')).toBe(true);
      
      // Release key
      const keyUpEvent = new KeyboardEvent('keyup', { key: 'ArrowUp' });
      document.dispatchEvent(keyUpEvent);
      expect(inputHandler.isKeyPressed('ArrowUp')).toBe(false);
    });

    test('should handle multiple keys pressed simultaneously', () => {
      const keyEvent1 = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      const keyEvent2 = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      
      document.dispatchEvent(keyEvent1);
      document.dispatchEvent(keyEvent2);
      
      expect(inputHandler.isKeyPressed('ArrowUp')).toBe(true);
      expect(inputHandler.isKeyPressed('ArrowLeft')).toBe(true);
    });
  });

  describe('movement direction detection', () => {
    test('should return correct direction for arrow keys', () => {
      const upEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      document.dispatchEvent(upEvent);
      expect(inputHandler.getMovementDirection()).toBe('up');

      inputHandler.reset();
      const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      document.dispatchEvent(downEvent);
      expect(inputHandler.getMovementDirection()).toBe('down');

      inputHandler.reset();
      const leftEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      document.dispatchEvent(leftEvent);
      expect(inputHandler.getMovementDirection()).toBe('left');

      inputHandler.reset();
      const rightEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      document.dispatchEvent(rightEvent);
      expect(inputHandler.getMovementDirection()).toBe('right');
    });

    test('should return correct direction for WASD keys', () => {
      const wEvent = new KeyboardEvent('keydown', { key: 'w' });
      document.dispatchEvent(wEvent);
      expect(inputHandler.getMovementDirection()).toBe('up');

      inputHandler.reset();
      const sEvent = new KeyboardEvent('keydown', { key: 's' });
      document.dispatchEvent(sEvent);
      expect(inputHandler.getMovementDirection()).toBe('down');

      inputHandler.reset();
      const aEvent = new KeyboardEvent('keydown', { key: 'a' });
      document.dispatchEvent(aEvent);
      expect(inputHandler.getMovementDirection()).toBe('left');

      inputHandler.reset();
      const dEvent = new KeyboardEvent('keydown', { key: 'd' });
      document.dispatchEvent(dEvent);
      expect(inputHandler.getMovementDirection()).toBe('right');
    });

    test('should return null when no movement keys are pressed', () => {
      expect(inputHandler.getMovementDirection()).toBeNull();
    });

    test('should prioritize most recent key when multiple movement keys are pressed', () => {
      const upEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      const rightEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      
      document.dispatchEvent(upEvent);
      document.dispatchEvent(rightEvent);
      
      expect(inputHandler.getMovementDirection()).toBe('right');
    });
  });

  describe('event callbacks', () => {
    test('should call callback when movement key is pressed', () => {
      inputHandler.onMovementInput(mockCallback);
      
      const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      document.dispatchEvent(keyEvent);
      
      expect(mockCallback).toHaveBeenCalledWith('up');
    });

    test('should not call callback for non-movement keys', () => {
      inputHandler.onMovementInput(mockCallback);
      
      const keyEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      document.dispatchEvent(keyEvent);
      
      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe('cleanup', () => {
    test('should remove event listeners on cleanup', () => {
      const spy = jest.spyOn(document, 'removeEventListener');
      inputHandler.cleanup();
      
      expect(spy).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(spy).toHaveBeenCalledWith('keyup', expect.any(Function));
      
      spy.mockRestore();
    });
  });
});