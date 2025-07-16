class DialogState {
  constructor(npc, playerPosition) {
    this._validateInputs(npc, playerPosition);
    this._initializeState(npc, playerPosition);
  }

  _validateInputs(npc, playerPosition) {
    if (!npc) {
      throw new Error('DialogState requires a valid NPC');
    }
    if (!playerPosition || typeof playerPosition.x !== 'number' || typeof playerPosition.y !== 'number') {
      throw new Error('DialogState requires a valid player position');
    }
  }

  _initializeState(npc, playerPosition) {
    this.npc = npc;
    this.playerPosition = { ...playerPosition };
    this.isActive = true;
    this.currentMessageIndex = 0;
    this.onComplete = null;

    // Reset NPC dialog to beginning
    this.npc.resetDialog();
  }

  getCurrentMessage() {
    return this.npc.getCurrentDialog();
  }

  nextMessage() {
    if (this.hasMoreMessages()) {
      this.npc.nextDialog();
      this.currentMessageIndex++;
    } else {
      this._endDialog();
    }
  }

  hasMoreMessages() {
    return this.npc.hasMoreDialog();
  }

  reset() {
    this.npc.resetDialog();
    this.currentMessageIndex = 0;
    this.isActive = true;
  }

  handleInput(inputHandler) {
    const INPUT_KEYS = {
      ADVANCE: 'Enter',
      CANCEL: 'Escape'
    };

    const DIALOG_ACTIONS = {
      CONTINUE: 'continue',
      END: 'end'
    };

    if (inputHandler.isKeyPressed(INPUT_KEYS.ADVANCE)) {
      inputHandler.clearInput();
      return this._handleAdvanceInput();
    }

    if (inputHandler.isKeyPressed(INPUT_KEYS.CANCEL)) {
      inputHandler.clearInput();
      this._endDialog();
      return DIALOG_ACTIONS.END;
    }

    return DIALOG_ACTIONS.CONTINUE;
  }

  _handleAdvanceInput() {
    const DIALOG_ACTIONS = {
      CONTINUE: 'continue',
      END: 'end'
    };

    if (this.hasMoreMessages()) {
      this.nextMessage();
      return DIALOG_ACTIONS.CONTINUE;
    } else {
      this._endDialog();
      return DIALOG_ACTIONS.END;
    }
  }

  render(renderer) {
    // Draw NPC and player
    renderer.drawNPC(this.npc);
    renderer.drawPlayer(this.playerPosition);

    // Draw dialog box
    renderer.drawDialog({
      message: this.getCurrentMessage(),
      npcName: this.npc.name,
      hasMore: this.hasMoreMessages()
    });
  }

  getStateInfo() {
    return {
      npcId: this.npc.id,
      npcName: this.npc.name,
      currentMessageIndex: this.currentMessageIndex,
      totalMessages: this.npc.dialog.length,
      isActive: this.isActive,
      playerPosition: { ...this.playerPosition }
    };
  }

  _endDialog() {
    this.isActive = false;
    
    if (this.onComplete) {
      this.onComplete({
        npcId: this.npc.id,
        completed: true
      });
    }
  }
}

module.exports = DialogState;