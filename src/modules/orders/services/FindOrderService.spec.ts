import 'reflect-metadata';

import AppError from '@shared/errors/AppError';
import FakeCustomersRepository from '@modules/customers/repositories/fakes/FakeCustomersRepository';
import FakeProductsRepository from '@modules/products/repositories/fakes/FakeProductsRepository';
import FakeOrderRepository from '../repositories/fakes/FakeOrderRepository';
import FindOrderService from './FindOrderService';

let fakeCustomersRepository: FakeCustomersRepository;
let fakeProductsRepository: FakeProductsRepository;
let fakeOrderRepository: FakeOrderRepository;

let findOrderService: FindOrderService;

describe('FindOrder', () => {
  beforeEach(() => {
    fakeCustomersRepository = new FakeCustomersRepository();
    fakeProductsRepository = new FakeProductsRepository();
    fakeOrderRepository = new FakeOrderRepository();

    findOrderService = new FindOrderService(
      fakeOrderRepository,
      fakeProductsRepository,
      fakeCustomersRepository,
    );
  });

  it('should be able to find a order', async () => {
    const customer = await fakeCustomersRepository.create({
      name: 'Douglas Tesch',
      email: 'douglas@hotmail.com',
    });

    const product1 = await fakeProductsRepository.create({
      name: 'caneca',
      price: 50,
      quantity: 2,
    });

    const product2 = await fakeProductsRepository.create({
      name: 'copo',
      price: 50,
      quantity: 2,
    });

    const orderProducts = await fakeProductsRepository.findAllById([
      { id: product1.id },
      { id: product2.id },
    ]);

    const order = await fakeOrderRepository.create({
      customer,
      products: orderProducts.map(product => ({
        product_id: product.id,
        price: product.price,
        quantity: product.quantity,
      })),
    });

    const findOrder = await findOrderService.execute({
      id: order.id,
    });

    expect(findOrder?.id).toBe(order.id);
    expect(findOrder?.customer.email).toBe('douglas@hotmail.com');
  });

  it('should not be able to find an order with non existent id', async () => {
    await expect(
      findOrderService.execute({ id: 'non-existing-id' }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
