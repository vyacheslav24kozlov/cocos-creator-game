import {
  _decorator,
  Component,
  input,
  Input,
  EventKeyboard,
  KeyCode,
  Collider2D,
  Contact2DType,
  view,
  UITransform,
} from 'cc';
import {FallingItem} from './FallingItems/FallingItem';

const {ccclass, property} = _decorator;

@ccclass('BasketController')
export class BasketController extends Component {
  static SPEED = 300;

  @property
  public speed: number = BasketController.SPEED;

  private direction: number = 0;
  private boundary: number = 0;

  onLoad() {
    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    input.on(Input.EventType.KEY_UP, this.onKeyUp, this);

    this.boundary = this.computeBoundary();

    const collider = this.node.getComponent(Collider2D);
    if (collider) {
      collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    } else {
      console.error('Basket node has no Collider2D — BEGIN_CONTACT will not fire.');
    }
  }

  private computeBoundary() {
    const visibleSize = view.getVisibleSize();
    const basketWidth = this.node.getComponent(UITransform)?.width ?? 0;
    return visibleSize.width / 2 - basketWidth / 2;
  }

  onDestroy() {
    input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
  }

  private onKeyDown(event: EventKeyboard) {
    if (event.keyCode === KeyCode.ARROW_LEFT) this.direction = -1;
    if (event.keyCode === KeyCode.ARROW_RIGHT) this.direction = 1;
  }

  private onKeyUp(event: EventKeyboard) {
    if (event.keyCode === KeyCode.ARROW_LEFT || event.keyCode === KeyCode.ARROW_RIGHT) {
      this.direction = 0;
    }
  }

  update(dt: number) {
    if (this.direction !== 0) {
      const pos = this.node.position.clone();
      pos.x += this.direction * this.speed * dt;

      if (pos.x > this.boundary) pos.x = this.boundary;
      if (pos.x < -this.boundary) pos.x = -this.boundary;

      this.node.setPosition(pos);
    }
  }

  private onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D) {
    const fruit = otherCollider.getComponent(FallingItem);
    if (fruit) {
      // Корзина просто сообщает фрукту, что он пойман
      fruit.onCaught();
    }
  }
}