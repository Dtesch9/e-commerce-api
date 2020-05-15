import 'reflect-metadata';

import AppError from '@shared/errors/AppError';
import FakeCustomersRepository from '@modules/customers/repositories/fakes/FakeCustomersRepository';
import FakeProductsRepository from '@modules/products/repositories/fakes/FakeProductsRepository';
import FakeOrderRepository from '../repositories/fakes/FakeOrderRepository';
import CreateOrderService from './CreateOrderService';

let fakeCustomersRepository: FakeCustomersRepository;
let fakeProductsRepository: FakeProductsRepository;
let fakeOrderRepository: FakeOrderRepository;

let createOrderService: CreateOrderService;

describe('CreateCustomer', () => {
  beforeEach(() => {
    fakeCustomersRepository = new FakeCustomersRepository();
    fakeProductsRepository = new FakeProductsRepository();
    fakeOrderRepository = new FakeOrderRepository();

    createOrderService = new CreateOrderService(
      fakeOrderRepository,
      fakeProductsRepository,
      fakeCustomersRepository,
    );
  });

  it('should be able to create a new order', async () => {
    const customer = await fakeCustomersRepository.create({
      name: 'Douglas Tesch',
      email: 'douglas@hotmail.com',
    });

    const product = await fakeProductsRepository.create({
      name: 'caneca',
      price: 50,
      quantity: 2,
    });

    const product2 = await fakeProductsRepository.create({
      name: 'copo',
      price: 50,
      quantity: 2,
    });

    const requetedProducts = [
      {
        id: product.id,
        quantity: 1,
      },
      {
        id: product2.id,
        quantity: 1,
      },
    ];

    const order = await createOrderService.execute({
      customer_id: customer.id,
      products: requetedProducts,
    });

    const orderProducts = await fakeProductsRepository.findAllById([
      { id: product.id },
      { id: product2.id },
    ]);

    expect(order).toHaveProperty('id');
    expect(order.customer.name).toBe('Douglas Tesch');
    expect(order.order_products[0].quantity).toBe(1);
    expect(orderProducts).toHaveLength(2);
  });

  it('should not be able to create a new order with non existing customer', async () => {
    await expect(
      createOrderService.execute({
        customer_id: 'non-existing-id',
        products: [{ id: 'id', quantity: 1 }],
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to create a new order with quantity out of stock', async () => {
    const { id: customer_id } = await fakeCustomersRepository.create({
      name: 'Douglas Tesch',
      email: 'douglas@hotmail.com',
    });

    const product = await fakeProductsRepository.create({
      name: 'caneca',
      price: 50,
      quantity: 2,
    });

    await expect(
      createOrderService.execute({
        customer_id,
        products: [{ id: product.id, quantity: 4 }],
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should be able to update stock amount', async () => {
    const { id: customer_id } = await fakeCustomersRepository.create({
      name: 'Douglas Tesch',
      email: 'douglas@hotmail.com',
    });

    const stockProduct = await fakeProductsRepository.create({
      name: 'caneca',
      price: 50,
      quantity: 4,
    });

    await createOrderService.execute({
      customer_id,
      products: [{ id: stockProduct.id, quantity: 2 }],
    });

    const product = await fakeProductsRepository.findByName('caneca');

    expect(product?.quantity).toBe(2);
  });
});
