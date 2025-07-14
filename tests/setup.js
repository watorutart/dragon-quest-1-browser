/**
 * Jest テストセットアップファイル
 */

// Canvas APIのモック
global.HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
    fillRect: jest.fn(),
    fillStyle: '',
    font: '',
    fillText: jest.fn(),
    clearRect: jest.fn(),
    drawImage: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    translate: jest.fn(),
    scale: jest.fn(),
    rotate: jest.fn()
}));

// requestAnimationFrameのモック
global.requestAnimationFrame = jest.fn((callback) => {
    setTimeout(callback, 16); // 60fps相当
});

// performance.nowのモック
global.performance = {
    now: jest.fn(() => Date.now())
};

// console.logを抑制（必要に応じて）
// global.console = {
//     ...console,
//     log: jest.fn(),
//     error: jest.fn(),
//     warn: jest.fn()
// };