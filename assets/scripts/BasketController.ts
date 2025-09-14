import {
  _decorator,
  Component,
  input,
  Input,
  EventKeyboard,
  KeyCode,
  Collider2D,
  Contact2DType,
  IPhysics2DContact,
  view,
  UITransform,
} from 'cc';
import {Fruit} from './Fruit';
import {GameManager} from './GameManager';
import {FruitSpawner} from './FruitSpawner';

const {ccclass, property} = _decorator;


@ccclass('BasketController')
export class BasketController extends Component {
  @property
  public speed: number = 300;

  @property(GameManager)
  public gameManager: GameManager | null = null;


  @property(FruitSpawner)
  public fruitSpawner: FruitSpawner | null = null;


  private direction: number = 0;
  private boundary: number = 0;


  onLoad() {
    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    input.on(Input.EventType.KEY_UP, this.onKeyUp, this);

    // Автоматически рассчитываем границу на основе ширины экрана и корзины
    const visibleSize = view.getVisibleSize();
    const basketWidth = this.node.getComponent(UITransform)?.width ?? 0;
    this.boundary = visibleSize.width / 2 - basketWidth / 2;

    const collider = this.node.getComponent(Collider2D);
    if (collider) {
      collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    } else {
      console.error('Basket node has no Collider2D — BEGIN_CONTACT will not fire.');
    }
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


      // Ограничиваем позицию корзины по X
      if (pos.x > this.boundary) pos.x = this.boundary;
      if (pos.x < -this.boundary) pos.x = -this.boundary;


      this.node.setPosition(pos);
    }
  }

  private onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
    const fruit = otherCollider.getComponent(Fruit);
    if (fruit && this.gameManager && this.fruitSpawner) {
      fruit.onCaught(this.gameManager, this.fruitSpawner);
    }
  }
}