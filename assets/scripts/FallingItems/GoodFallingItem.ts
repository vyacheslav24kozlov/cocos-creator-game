import {_decorator} from 'cc';
import {GameEvents} from '../GameEvents';
import {FallingItem} from "db://assets/scripts/FallingItems/FallingItem";

const {ccclass} = _decorator;

@ccclass('GoodFallingItem')
export class GoodFallingItem extends FallingItem {
  public onCaught() {
    // предотвращаем повторное срабатывание
    if (this.isCaught) return;
    super.onCaught();
    // хороший продукт сообщает, что его поймали
    this.node.scene.emit(GameEvents.GOOD_FALLING_ITEM_CAUGHT, this.node);
  }
}