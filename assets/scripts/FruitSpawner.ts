import {
  _decorator,
  Component,
  Prefab,
  Vec3,
  Node,
  UITransform,
  view
} from 'cc';
import {GameEvents} from './GameEvents';
import {FruitPool} from './FallingItems/FruitPool';

const {ccclass, property} = _decorator;

@ccclass('FruitSpawner')
export class FruitSpawner extends Component {
  @property([Prefab])
  public fruitPrefabs: Prefab[] = [];

  private pools: Map<string, FruitPool> = new Map();

  start() {
    for (const prefab of this.fruitPrefabs) {
      this.pools.set(prefab.data.name, new FruitPool(prefab));
    }
    this.setupListeners();
  }

  setupListeners() {
    this.node.scene.on(GameEvents.SPAWN_FRUIT, this.spawnFruit, this);
    this.node.scene.on(GameEvents.GAME_OVER, this.recycleAllFruits, this);
  }

  onDestroy() {
    this.node.scene.off(GameEvents.SPAWN_FRUIT, this.spawnFruit, this);
  }

  public spawnFruit() {
    if (this.fruitPrefabs.length === 0) return;
    const prefab = this.fruitPrefabs[Math.floor(Math.random() * this.fruitPrefabs.length)];
    const pool = this.pools.get(prefab.data.name)!;

    const fruitNode = pool.get();
    fruitNode.setParent(this.node);
    fruitNode.active = true;

    fruitNode.once(GameEvents.FALLING_ITEM_MISSED, this.recycleFruit, this);

    const visibleSize = view.getVisibleSize();
    const fruitWidth = fruitNode.getComponent(UITransform)?.width ?? 0;
    const halfWidth = visibleSize.width / 2 - fruitWidth / 2;

    const x = (Math.random() * 2 - 1) * halfWidth;
    fruitNode.setPosition(new Vec3(x, 0, 0));
  }

  public recycleFruit(node: Node) {
    node.off(GameEvents.FALLING_ITEM_MISSED, this.recycleFruit, this);

    const pool = this.pools.get(node.name);
    if (pool) {
      pool.put(node);
    } else {
      node.destroy();
    }
  }

  public recycleAllFruits() {
    for (const child of [...this.node.children]) {
      this.recycleFruit(child);
    }
  }
}