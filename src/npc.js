class NPC {
  constructor(data) {
    this._validateRequiredProperties(data);
    this._initializeProperties(data);
    this._initializeDialogState();
  }

  _validateRequiredProperties(data) {
    const requiredProps = ['id', 'name', 'x', 'y', 'dialog'];
    const missingProps = requiredProps.filter(prop => 
      !data || data[prop] === undefined || data[prop] === null
    );
    
    if (missingProps.length > 0) {
      throw new Error('NPC requires id, name, x, y, and dialog properties');
    }
  }

  _initializeProperties(data) {
    this.id = data.id;
    this.name = data.name;
    this.x = data.x;
    this.y = data.y;
    this.sprite = data.sprite || 'default_npc.png';
    this.dialog = Array.isArray(data.dialog) ? [...data.dialog] : [data.dialog];
  }

  _initializeDialogState() {
    this.currentDialogIndex = 0;
  }

  // Position management
  getPosition() {
    return { x: this.x, y: this.y };
  }

  setPosition(x, y) {
    if (x < 0 || y < 0) {
      throw new Error('Position coordinates must be non-negative');
    }
    this.x = x;
    this.y = y;
  }

  // Dialog management
  getCurrentDialog() {
    return this.dialog[this.currentDialogIndex];
  }

  nextDialog() {
    this.currentDialogIndex++;
    if (this.currentDialogIndex >= this.dialog.length) {
      this.currentDialogIndex = 0; // Reset to beginning
    }
  }

  hasMoreDialog() {
    return this.currentDialogIndex < this.dialog.length - 1;
  }

  resetDialog() {
    this.currentDialogIndex = 0;
  }

  // Interaction management
  canInteractWith(playerX, playerY) {
    const dx = Math.abs(this.x - playerX);
    const dy = Math.abs(this.y - playerY);
    
    // Player must be adjacent (1 tile away in cardinal directions)
    return this._isAdjacentPosition(dx, dy);
  }

  _isAdjacentPosition(dx, dy) {
    const ADJACENT_DISTANCE = 1;
    return (dx === ADJACENT_DISTANCE && dy === 0) || (dx === 0 && dy === ADJACENT_DISTANCE);
  }

  // Data serialization
  getData() {
    return {
      id: this.id,
      name: this.name,
      x: this.x,
      y: this.y,
      sprite: this.sprite,
      dialog: [...this.dialog]
    };
  }
}

// ブラウザ環境ではグローバルスコープで利用可能
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NPC;
}