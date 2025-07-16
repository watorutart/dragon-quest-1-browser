const NPC = require('../src/npc');

describe('NPC Class', () => {
  describe('NPC Creation and Data Management', () => {
    test('should create NPC with basic properties', () => {
      const npcData = {
        id: 'king',
        name: '王様',
        x: 11,
        y: 11,
        sprite: 'king.png',
        dialog: ['勇者よ、竜王を倒してくれ！']
      };

      const npc = new NPC(npcData);

      expect(npc.id).toBe('king');
      expect(npc.name).toBe('王様');
      expect(npc.x).toBe(11);
      expect(npc.y).toBe(11);
      expect(npc.sprite).toBe('king.png');
      expect(npc.dialog).toEqual(['勇者よ、竜王を倒してくれ！']);
    });

    test('should throw error when required properties are missing', () => {
      expect(() => {
        new NPC({});
      }).toThrow('NPC requires id, name, x, y, and dialog properties');

      expect(() => {
        new NPC({ id: 'test' });
      }).toThrow('NPC requires id, name, x, y, and dialog properties');
    });

    test('should set default sprite if not provided', () => {
      const npcData = {
        id: 'villager',
        name: '村人',
        x: 5,
        y: 5,
        dialog: ['こんにちは！']
      };

      const npc = new NPC(npcData);
      expect(npc.sprite).toBe('default_npc.png');
    });

    test('should handle multiple dialog messages', () => {
      const npcData = {
        id: 'merchant',
        name: '商人',
        x: 10,
        y: 15,
        dialog: [
          'いらっしゃいませ！',
          '何か買っていきませんか？',
          'またのお越しをお待ちしております。'
        ]
      };

      const npc = new NPC(npcData);
      expect(npc.dialog).toHaveLength(3);
      expect(npc.dialog[0]).toBe('いらっしゃいませ！');
      expect(npc.dialog[2]).toBe('またのお越しをお待ちしております。');
    });
  });

  describe('NPC Position Management', () => {
    let npc;

    beforeEach(() => {
      npc = new NPC({
        id: 'test_npc',
        name: 'テストNPC',
        x: 10,
        y: 10,
        dialog: ['テストメッセージ']
      });
    });

    test('should get current position', () => {
      const position = npc.getPosition();
      expect(position).toEqual({ x: 10, y: 10 });
    });

    test('should set new position', () => {
      npc.setPosition(15, 20);
      expect(npc.x).toBe(15);
      expect(npc.y).toBe(20);
      expect(npc.getPosition()).toEqual({ x: 15, y: 20 });
    });

    test('should validate position coordinates', () => {
      expect(() => {
        npc.setPosition(-1, 5);
      }).toThrow('Position coordinates must be non-negative');

      expect(() => {
        npc.setPosition(5, -1);
      }).toThrow('Position coordinates must be non-negative');
    });
  });

  describe('NPC Dialog Management', () => {
    let npc;

    beforeEach(() => {
      npc = new NPC({
        id: 'dialog_npc',
        name: '対話NPC',
        x: 5,
        y: 5,
        dialog: [
          '最初のメッセージ',
          '2番目のメッセージ',
          '最後のメッセージ'
        ]
      });
    });

    test('should get current dialog message', () => {
      expect(npc.getCurrentDialog()).toBe('最初のメッセージ');
    });

    test('should advance to next dialog message', () => {
      expect(npc.getCurrentDialog()).toBe('最初のメッセージ');
      
      npc.nextDialog();
      expect(npc.getCurrentDialog()).toBe('2番目のメッセージ');
      
      npc.nextDialog();
      expect(npc.getCurrentDialog()).toBe('最後のメッセージ');
    });

    test('should reset dialog when reaching the end', () => {
      npc.nextDialog(); // 2番目
      npc.nextDialog(); // 最後
      npc.nextDialog(); // リセットして最初に戻る
      
      expect(npc.getCurrentDialog()).toBe('最初のメッセージ');
    });

    test('should check if dialog has more messages', () => {
      expect(npc.hasMoreDialog()).toBe(true);
      
      npc.nextDialog();
      expect(npc.hasMoreDialog()).toBe(true);
      
      npc.nextDialog();
      expect(npc.hasMoreDialog()).toBe(false);
    });

    test('should reset dialog to beginning', () => {
      npc.nextDialog();
      npc.nextDialog();
      
      npc.resetDialog();
      expect(npc.getCurrentDialog()).toBe('最初のメッセージ');
      expect(npc.hasMoreDialog()).toBe(true);
    });
  });

  describe('NPC Interaction', () => {
    let npc;

    beforeEach(() => {
      npc = new NPC({
        id: 'interactive_npc',
        name: 'インタラクティブNPC',
        x: 8,
        y: 12,
        dialog: ['こんにちは、勇者よ！']
      });
    });

    test('should check if player is adjacent for interaction', () => {
      // Adjacent positions (should return true)
      expect(npc.canInteractWith(7, 12)).toBe(true); // left
      expect(npc.canInteractWith(9, 12)).toBe(true); // right
      expect(npc.canInteractWith(8, 11)).toBe(true); // up
      expect(npc.canInteractWith(8, 13)).toBe(true); // down
      
      // Non-adjacent positions (should return false)
      expect(npc.canInteractWith(6, 12)).toBe(false); // too far left
      expect(npc.canInteractWith(8, 10)).toBe(false); // too far up
      expect(npc.canInteractWith(10, 14)).toBe(false); // diagonal and far
    });

    test('should get NPC data for serialization', () => {
      const data = npc.getData();
      
      expect(data).toEqual({
        id: 'interactive_npc',
        name: 'インタラクティブNPC',
        x: 8,
        y: 12,
        sprite: 'default_npc.png',
        dialog: ['こんにちは、勇者よ！']
      });
    });
  });
});