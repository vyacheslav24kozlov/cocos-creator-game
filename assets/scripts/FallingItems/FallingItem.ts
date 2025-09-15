import {_decorator, Component, tween, Vec3, UITransform} from 'cc';
import {GameEvents} from '../GameEvents';

const {ccclass, property} = _decorator;

@ccclass('FallingItem')
export class FallingItem extends Component {
  @property
  public fallSpeed: number = 200;

  protected isCaught: boolean = false;

  private missY = -950; // Y-координата, ниже которой фрукт считается пропущенным

  start() {
    this.missY = this.computeMissY();
  }

  private computeMissY(): number {
    const canvas = this.node.scene.getChildByName('Canvas');
    if (!canvas) return this.missY; // fallback
    const heightCanvas = canvas.getComponent(UITransform)?.height ?? 0;
    const heightComponent = this.node.getComponent(UITransform)?.height ?? 0;
    return -(heightCanvas - heightComponent) / 2;
  }

  update(dt: number) {
    if (this.isCaught) {
      return;
    }

    const pos = this.node.position.clone();
    pos.y -= this.fallSpeed * dt;
    this.node.setPosition(pos);

    // Проверяем, не упал ли фрукт ниже границы
    if (pos.y < this.missY) {
      this.node.active = false;
      this.node.emit(GameEvents.FALLING_ITEM_MISSED, this.node);
    }
  }

  public onCaught() {
    this.isCaught = true;
    // Анимация попадания фрукта в корзину
    tween(this.node)
      .to(
        0.25,
        {scale: new Vec3(0, 0, 0)},
        {easing: 'quadOut'}
      )
      .call(() => {
        this.node.setScale(new Vec3(1, 1, 1));
        this.isCaught = false;
        this.node.active = false;
        this.node.emit(GameEvents.FALLING_ITEM_MISSED, this.node);
      })
      .start();
  }
}