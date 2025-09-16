import {_decorator} from 'cc';
import {GameEvents} from '../GameEvents';
import {FallingItem} from "db://assets/scripts/FallingItems/FallingItem";

const {ccclass} = _decorator;

@ccclass('BadFallingItem')
export class BadFallingItem extends FallingItem {
  public onCaught() {
    // предотвращаем повторное срабатывание
    if (this.isCaught) return;
    super.onCaught();
    // Плохой продукт сообщает, что его поймали
    this.node.scene.emit(GameEvents.BAD_FALLING_ITEM_CAUGHT, this.node);
  }
}