import {
  _decorator,
  Component,
  Prefab,
  instantiate,
  Vec3,
  NodePool,
  Node,
  UITransform,
  view
} from 'cc';
import {Fruit} from './Fruit';

const {ccclass, property} = _decorator;

@ccclass('FruitSpawner')
export class FruitSpawner extends Component {
  static MISS_Y = -400;

  @property([Prefab])
  public fruitPrefabs: Prefab[] = [];

  @property(Node)
  public basket: Node | null = null;

  private pools: Map<string, NodePool> = new Map();
  private missY: number = FruitSpawner.MISS_Y;

  start() {
    // Создаем пулы для всех типов фруктов
    for (const prefab of this.fruitPrefabs) {
      this.pools.set(prefab.data.name, new NodePool());
    }

    // Вычисляем порог промаха по нижней грани корзины
    this.missY = this.computeMissY(0);
  }

  private computeMissY(offset: number = 0): number {
    if (!this.basket) return FruitSpawner.MISS_Y;

    const basketUI = this.basket.getComponent(UITransform);
    const spawnerUI = this.node.getComponent(UITransform);
    if (!basketUI || !spawnerUI) return FruitSpawner.MISS_Y;

    const bottomLocal = new Vec3(0, -basketUI.height * (1 - basketUI.anchorY), 0);
    const bottomWorld = basketUI.convertToWorldSpaceAR(bottomLocal);
    const bottomInSpawner = spawnerUI.convertToNodeSpaceAR(bottomWorld);

    return bottomInSpawner.y + offset;
  }

  public spawnFruit() {
    if (this.fruitPrefabs.length === 0) return;
    const prefab = this.fruitPrefabs[Math.floor(Math.random() * this.fruitPrefabs.length)];
    const pool = this.pools.get(prefab.data.name)!;

    let fruitNode: Node;
    if (pool.size() > 0) {
      fruitNode = pool.get()!;
    } else {
      fruitNode = instantiate(prefab);
    }

    fruitNode.setParent(this.node);

    const visibleSize = view.getVisibleSize();
    const fruitWidth = fruitNode.getComponent(UITransform)?.width ?? 0;
    const halfWidth = visibleSize.width / 2 - fruitWidth / 2;

    const x = (Math.random() * 2 - 1) * halfWidth;
    fruitNode.setPosition(new Vec3(x, 0, 0));
  }

  public recycleFruit(node: Node) {
    const pool = this.pools.get(node.name);
    pool ? pool.put(node) : node.destroy();
  }

  public clearAllFruits() {
    for (const child of [...this.node.children]) {
      this.recycleFruit(child);
    }
  }

  update(dt: number) {
    // Проверяем, упали ли фрукты ниже порога
    for (const child of this.node.children) {
      const fruit = child.getComponent(Fruit);
      if (!fruit) continue;

      if (child.position.y < this.missY) {
        this.recycleFruit(child);
      }
    }
  }
}
