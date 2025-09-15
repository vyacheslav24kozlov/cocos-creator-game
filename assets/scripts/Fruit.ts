import { _decorator, Component, tween, Vec3 } from 'cc';
import { GameEvents } from './GameEvents';

const {ccclass, property} = _decorator;

@ccclass('Fruit')
export class Fruit extends Component {
  @property
  public fallSpeed: number = 200;

  private isCaught: boolean = false;

  update(dt: number) {
    if (this.isCaught) {
      return;
    }

    const pos = this.node.position.clone();
    pos.y -= this.fallSpeed * dt;
    this.node.setPosition(pos);

    // Проверяем, не упал ли фрукт ниже границы
    if (pos.y < -400) {
      this.node.emit(GameEvents.FRUIT_MISSED, this.node);
      this.node.active = false; // "Убираем" фрукт, пока его не переработает Spawner
    }
  }

  public onCaught() {
    if (this.isCaught) return;
    this.isCaught = true;

    // Фрукт сообщает, что его поймали
    this.node.emit(GameEvents.FRUIT_CAUGHT, this.node);

    // Анимация попадания фрукта в корзину
    tween(this.node)
      .to(
        0.25,
        { scale: new Vec3(0, 0, 0) },
        { easing: 'quadOut' }
      )
      .call(() => {
        // После анимации фрукт готов к переработке
        this.node.emit(GameEvents.FRUIT_MISSED, this.node); // Используем то же событие для переработки
        this.node.setScale(new Vec3(1, 1, 1));
        this.isCaught = false;
        this.node.active = false;
      })
      .start();
  }
}