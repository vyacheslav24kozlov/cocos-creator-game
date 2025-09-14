import {_decorator, Component, tween, Vec3} from 'cc';
import {GameManager} from './GameManager';
import {FruitSpawner} from './FruitSpawner';

const {ccclass, property} = _decorator;

@ccclass('Fruit')
export class Fruit extends Component {
  @property
  public fallSpeed: number = 200;

  private isCaught: boolean = false;

  update(dt: number) {
    const pos = this.node.position.clone();
    pos.y -= this.fallSpeed * dt;
    this.node.setPosition(pos);
  }

  public onCaught(gameManager: GameManager, spawner: FruitSpawner) {
    if (this.isCaught) return;
    this.isCaught = true;

    gameManager.addScore(1);

    // Анимация попадания фрукта в корзину
    tween(this.node)
      .to(
        0.25,
        { scale: new Vec3(0, 0, 0) },
        { easing: 'quadOut' }
      )
      .call(() => {
        spawner.recycleFruit(this.node);
        this.node.setScale(new Vec3(1, 1, 1));
        this.isCaught = false;
      })
      .start();
  }
}