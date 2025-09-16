import { Node, NodePool, Prefab, instantiate } from 'cc';

export class ItemPool {
  private pool: NodePool;
  private readonly prefab: Prefab;

  constructor(prefab: Prefab) {
    this.prefab = prefab;
    this.pool = new NodePool();
  }

  // Получает узел из пула или создаёт новый, если пул пуст
  public get(): Node {
    let fruitNode: Node;
    if (this.pool.size() > 0) {
      fruitNode = this.pool.get()!;
    } else {
      fruitNode = instantiate(this.prefab);
    }
    return fruitNode;
  }

  // Возвращает узел обратно в пул для повторного использования
  public put(node: Node): void {
    this.pool.put(node);
  }

  public clear(): void {
    this.pool.clear();
  }
}