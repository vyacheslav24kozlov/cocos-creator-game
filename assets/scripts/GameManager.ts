import {_decorator, Component, Label, tween, Vec3, Node} from 'cc';
import {GameEvents} from './GameEvents';

const {ccclass, property} = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
  static TIME_LEFT = 60;

  @property(Label)
  public scoreLabel: Label | null = null;

  @property(Label)
  public timerLabel: Label | null = null;

  @property(Node)
  private gameOver: Node | null = null;

  private score: number = 0;
  private timeLeft: number = GameManager.TIME_LEFT;

  start() {
    this.updateUI();
    this.schedule(this.tickTimer, 1);
    this.schedule(this.spawnLoop, 1);

    this.setupListeners();
  }

  private setupListeners() {
    this.node.scene.on(GameEvents.GOOD_FALLING_ITEM_CAUGHT, this.onGoodFallingItemCaught, this);
    this.node.scene.on(GameEvents.BAD_FALLING_ITEM_CAUGHT, this.onBadFallingItemCaught, this);
  }

  onDestroy() {
    this.node.scene.off(GameEvents.GOOD_FALLING_ITEM_CAUGHT, this.onGoodFallingItemCaught, this);
    this.node.scene.off(GameEvents.BAD_FALLING_ITEM_CAUGHT, this.onBadFallingItemCaught, this);
  }

  private onBadFallingItemCaught() {
    console.log('Bad item caught - game over!');
  }

  private onGoodFallingItemCaught() {
    this.addScore(1);
  }

  // Новый метод, который испускает событие для FruitSpawner
  private spawnLoop() {
    this.node.scene.emit(GameEvents.SPAWN_FRUIT);
  }

  public addScore(amount: number) {
    this.score += amount;
    this.updateUI();

    if (this.scoreLabel) {
      const node = this.scoreLabel.node;
      node.setScale(new Vec3(1, 1, 1));
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
      this.endGame();
    }
  }

  private updateUI() {
    if (this.scoreLabel) this.scoreLabel.string = `Score: ${this.score}`;
    if (this.timerLabel) this.timerLabel.string = `Time: ${this.timeLeft}`;
  }

  private endGame() {
    this.node.scene.emit(GameEvents.GAME_OVER);
    this.unschedule(this.tickTimer);
    this.unschedule(this.spawnLoop);

    if (this.gameOver) {
      this.gameOver.active = true;
    }
  }

  public restartGame() {
    this.score = 0;
    this.timeLeft = GameManager.TIME_LEFT;
    this.updateUI();

    if (this.gameOver) {
      this.gameOver.active = false;
    }

    this.schedule(this.tickTimer, 1);
    this.schedule(this.spawnLoop, 1);
  }
}