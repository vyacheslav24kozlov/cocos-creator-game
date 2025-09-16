import {_decorator, Component, Label, tween, Vec3, Node, Prefab, instantiate} from 'cc';
import {GameEvents} from './GameEvents';

const {ccclass, property} = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
  static TIME_LEFT = 30;
  static START_LIVES = 3;

  @property(Label)
  private scoreLabel: Label | null = null;

  @property(Label)
  private timerLabel: Label | null = null;

  @property(Node)
  private gameOver: Node | null = null;

  @property(Label)
  private gameOverLabel: Label | null = null;

  @property(Prefab)
  private heartPrefab: Prefab | null = null;

  @property(Node)
  private heartsContainer: Node | null = null;

  private score: number = 0;
  private timeLeft: number = GameManager.TIME_LEFT;
  private lives: number = GameManager.START_LIVES;
  private heartNodes: Node[] = [];

  start() {
    this.updateUI();
    this.setupHeart();
    // таймер и спавн items
    this.schedule(this.tickTimer, 1);
    this.schedule(this.spawnLoop, 1);

    this.setupListeners();
  }

  private setupListeners() {
    // слушаем события попадания в корзину хороши и плохих items
    this.node.scene.on(GameEvents.GOOD_FALLING_ITEM_CAUGHT, this.onGoodFallingItemCaught, this);
    this.node.scene.on(GameEvents.BAD_FALLING_ITEM_CAUGHT, this.onBadFallingItemCaught, this);
  }

  private setupHeart() {
    if (!this.heartPrefab || !this.heartsContainer) {
      console.error('Heart prefab or container is not assigned!');
      return;
    }

    // расстояние между жизнями в виде сердечек
    const spacing = 100;
    const startX = -((GameManager.START_LIVES - 1) * spacing) / 2;

    for (let i = 0; i < GameManager.START_LIVES; i++) {
      const heart = instantiate(this.heartPrefab);
      // вычисляем позицию по X для равномерного распределения
      heart.setPosition(startX + i * spacing, 0, 0);
      this.heartsContainer.addChild(heart);
      this.heartNodes.push(heart);
    }
  }

  onDestroy() {
    this.node.scene.off(GameEvents.GOOD_FALLING_ITEM_CAUGHT, this.onGoodFallingItemCaught, this);
    this.node.scene.off(GameEvents.BAD_FALLING_ITEM_CAUGHT, this.onBadFallingItemCaught, this);
    this.unschedule(this.tickTimer);
    this.unschedule(this.spawnLoop);
  }

  private onBadFallingItemCaught() {
    this.lives--;
    if (this.lives >= 0 && this.lives < this.heartNodes.length) {
      this.heartNodes[this.lives].active = false;
    }
    if (this.lives <= 0) {
      this.endGame(false);
    }
  }

  private onGoodFallingItemCaught() {
    this.addScore(1);
  }

  private spawnLoop() {
    this.node.scene.emit(GameEvents.SPAWN_FRUIT);
  }

  public addScore(amount: number) {
    this.score += amount;
    this.updateUI();

    if (this.scoreLabel) {
      const node = this.scoreLabel.node;
      node.setScale(new Vec3(1, 1, 1));
      // анимация добавления очков
      tween(node)
        .to(0.15, {scale: new Vec3(1.1, 1.1, 1)}, {easing: 'quadOut'})
        .to(0.15, {scale: new Vec3(1, 1, 1)}, {easing: 'bounceOut'})
        .start();
    }
  }

  private tickTimer() {
    this.timeLeft--;
    this.updateUI();
    if (this.timeLeft <= 0) {
      this.endGame(true);
    }
  }

  private updateUI() {
    if (this.scoreLabel) this.scoreLabel.string = `Score: ${this.score}`;
    if (this.timerLabel) this.timerLabel.string = `Time: ${this.timeLeft}`;
  }

  private endGame(timeEnded: boolean) {
    // эмитим событие для удаления всех оставшихся items со сцены
    this.node.scene.emit(GameEvents.GAME_OVER);
    this.unschedule(this.tickTimer);
    this.unschedule(this.spawnLoop);

    if (this.gameOver && this.gameOverLabel) {
      this.gameOverLabel.string = `${timeEnded ? 'Time Over' : 'Game Over'}\nYour score: ${this.score}`;
      this.gameOver.active = true;
    }
  }

  public restartGame() {
    this.score = 0;
    this.timeLeft = GameManager.TIME_LEFT;
    this.lives = GameManager.START_LIVES;
    this.heartNodes.forEach(heart => heart.active = true);
    this.updateUI();

    if (this.gameOver) {
      this.gameOver.active = false;
    }

    this.schedule(this.tickTimer, 1);
    this.schedule(this.spawnLoop, 1);
  }
}