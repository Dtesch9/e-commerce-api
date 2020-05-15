import { uuid } from 'uuidv4';

import IOrdersRepository from '@modules/orders/repositories/IOrdersRepository';
import ICreateOrderDTO from '@modules/orders/dtos/ICreateOrderDTO';
import Order from '../../infra/typeorm/entities/Order';

class OrdersRepository implements IOrdersRepository {
  private orders: Order[] = [];

  public async create({ customer, products }: ICreateOrderDTO): Promise<Order> {
    const order = new Order();

    Object.assign(order, {
      id: uuid(),
      customer,
      order_products: products,
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    this.orders.push(order);

    return order;
  }

  public async findById(id: string): Promise<Order | undefined> {
    const order = this.orders.find(findOrder => findOrder.id === id);

    return order;
  }
}

export default OrdersRepository;
