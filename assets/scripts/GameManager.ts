import {_decorator, Component, Label, tween, Vec3, Node} from 'cc';
import {FruitSpawner} from './FruitSpawner';

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

  @property(FruitSpawner)
  private fruitSpawner: FruitSpawner | null = null;

  private score: number = 0;
  private timeLeft: number = GameManager.TIME_LEFT;

  start() {
    this.updateUI();
    this.schedule(this.tickTimer, 1);
    this.schedule(this.spawnLoop, 1); // управляем спавном фруктов
  }

  private spawnLoop() {
    if (this.fruitSpawner) {
      this.fruitSpawner.spawnFruit();
    }
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
    this.unschedule(this.tickTimer);
    this.unschedule(this.spawnLoop); // останавливаем спавн

    if (this.fruitSpawner) {
      this.fruitSpawner.clearAllFruits(); // убираем все фрукты со сцены
    }

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