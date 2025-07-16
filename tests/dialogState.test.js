const DialogState = require('../src/dialogState');
const NPC = require('../src/npc');

describe('DialogState Class', () => {
  let mockRenderer;
  let mockInputHandler;
  let testNPC;

  beforeEach(() => {
    mockRenderer = {
      clearScreen: jest.fn(),
      drawDialog: jest.fn(),
      drawNPC: jest.fn(),
      drawPlayer: jest.fn()
    };

    mockInputHandler = {
      isKeyPressed: jest.fn(),
      clearInput: jest.fn()
    };

    testNPC = new NPC({
      id: 'test_npc',
      name: 'テストNPC',
      x: 10,
      y: 10,
      dialog: [
        'こんにちは、勇者よ！',
        'この世界は危険に満ちている。',
        '気をつけて旅をするのじゃ。'
      ]
    });
  });

  describe('DialogState Creation and Initialization', () => {
    test('should create DialogState with NPC and player position', () => {
      const playerPosition = { x: 9, y: 10 };
      const dialogState = new DialogState(testNPC, playerPosition);

      expect(dialogState.npc).toBe(testNPC);
      expect(dialogState.playerPosition).toEqual(playerPosition);
      expect(dialogState.isActive).toBe(true);
      expect(dialogState.getCurrentMessage()).toBe('こんにちは、勇者よ！');
    });

    test('should throw error when NPC is not provided', () => {
      expect(() => {
        new DialogState(null, { x: 5, y: 5 });
      }).toThrow('DialogState requires a valid NPC');
    });

    test('should throw error when player position is not provided', () => {
      expect(() => {
        new DialogState(testNPC, null);
      }).toThrow('DialogState requires a valid player position');
    });

    test('should initialize with first dialog message', () => {
      const dialogState = new DialogState(testNPC, { x: 9, y: 10 });
      expect(dialogState.getCurrentMessage()).toBe('こんにちは、勇者よ！');
    });
  });

  describe('Dialog Flow Management', () => {
    let dialogState;

    beforeEach(() => {
      dialogState = new DialogState(testNPC, { x: 9, y: 10 });
    });

    test('should advance to next dialog message', () => {
      expect(dialogState.getCurrentMessage()).toBe('こんにちは、勇者よ！');
      
      dialogState.nextMessage();
      expect(dialogState.getCurrentMessage()).toBe('この世界は危険に満ちている。');
      
      dialogState.nextMessage();
      expect(dialogState.getCurrentMessage()).toBe('気をつけて旅をするのじゃ。');
    });

    test('should check if more messages are available', () => {
      expect(dialogState.hasMoreMessages()).toBe(true);
      
      dialogState.nextMessage();
      expect(dialogState.hasMoreMessages()).toBe(true);
      
      dialogState.nextMessage();
      expect(dialogState.hasMoreMessages()).toBe(false);
    });

    test('should end dialog when no more messages', () => {
      dialogState.nextMessage(); // 2nd message
      dialogState.nextMessage(); // 3rd message
      dialogState.nextMessage(); // Should end dialog
      
      expect(dialogState.isActive).toBe(false);
    });

    test('should reset dialog state', () => {
      dialogState.nextMessage();
      dialogState.nextMessage();
      
      dialogState.reset();
      
      expect(dialogState.getCurrentMessage()).toBe('こんにちは、勇者よ！');
      expect(dialogState.hasMoreMessages()).toBe(true);
      expect(dialogState.isActive).toBe(true);
    });
  });

  describe('Input Handling', () => {
    let dialogState;

    beforeEach(() => {
      dialogState = new DialogState(testNPC, { x: 9, y: 10 });
    });

    test('should advance dialog on Enter key press', () => {
      mockInputHandler.isKeyPressed.mockReturnValue(false);
      mockInputHandler.isKeyPressed.mockReturnValueOnce(true); // Enter key

      const result = dialogState.handleInput(mockInputHandler);
      
      expect(dialogState.getCurrentMessage()).toBe('この世界は危険に満ちている。');
      expect(result).toBe('continue');
      expect(mockInputHandler.clearInput).toHaveBeenCalled();
    });

    test('should end dialog on Escape key press', () => {
      mockInputHandler.isKeyPressed.mockImplementation((key) => key === 'Escape');

      const result = dialogState.handleInput(mockInputHandler);
      
      expect(dialogState.isActive).toBe(false);
      expect(result).toBe('end');
      expect(mockInputHandler.clearInput).toHaveBeenCalled();
    });

    test('should end dialog when reaching last message', () => {
      // Move to last message
      dialogState.nextMessage();
      dialogState.nextMessage();
      
      mockInputHandler.isKeyPressed.mockImplementation((key) => key === 'Enter');

      const result = dialogState.handleInput(mockInputHandler);
      
      expect(dialogState.isActive).toBe(false);
      expect(result).toBe('end');
    });

    test('should ignore other key presses', () => {
      const initialMessage = dialogState.getCurrentMessage();
      mockInputHandler.isKeyPressed.mockReturnValue(false);

      const result = dialogState.handleInput(mockInputHandler);
      
      expect(dialogState.getCurrentMessage()).toBe(initialMessage);
      expect(result).toBe('continue');
      expect(mockInputHandler.clearInput).not.toHaveBeenCalled();
    });
  });

  describe('Rendering', () => {
    let dialogState;

    beforeEach(() => {
      dialogState = new DialogState(testNPC, { x: 9, y: 10 });
    });

    test('should render dialog box with current message', () => {
      dialogState.render(mockRenderer);

      expect(mockRenderer.drawDialog).toHaveBeenCalledWith({
        message: 'こんにちは、勇者よ！',
        npcName: 'テストNPC',
        hasMore: true
      });
    });

    test('should render NPC and player positions', () => {
      dialogState.render(mockRenderer);

      expect(mockRenderer.drawNPC).toHaveBeenCalledWith(testNPC);
      expect(mockRenderer.drawPlayer).toHaveBeenCalledWith({ x: 9, y: 10 });
    });

    test('should indicate when no more messages available', () => {
      // Move to last message
      dialogState.nextMessage();
      dialogState.nextMessage();
      
      dialogState.render(mockRenderer);

      expect(mockRenderer.drawDialog).toHaveBeenCalledWith({
        message: '気をつけて旅をするのじゃ。',
        npcName: 'テストNPC',
        hasMore: false
      });
    });
  });

  describe('Dialog State Management', () => {
    let dialogState;

    beforeEach(() => {
      dialogState = new DialogState(testNPC, { x: 9, y: 10 });
    });

    test('should get dialog state information', () => {
      const stateInfo = dialogState.getStateInfo();

      expect(stateInfo).toEqual({
        npcId: 'test_npc',
        npcName: 'テストNPC',
        currentMessageIndex: 0,
        totalMessages: 3,
        isActive: true,
        playerPosition: { x: 9, y: 10 }
      });
    });

    test('should update state info as dialog progresses', () => {
      dialogState.nextMessage();
      const stateInfo = dialogState.getStateInfo();

      expect(stateInfo.currentMessageIndex).toBe(1);
      expect(stateInfo.isActive).toBe(true);
    });

    test('should handle dialog completion', () => {
      const onComplete = jest.fn();
      dialogState.onComplete = onComplete;

      // Progress through all messages
      dialogState.nextMessage();
      dialogState.nextMessage();
      dialogState.nextMessage(); // This should trigger completion

      expect(onComplete).toHaveBeenCalledWith({
        npcId: 'test_npc',
        completed: true
      });
    });
  });
});