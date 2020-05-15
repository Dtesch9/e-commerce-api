import 'reflect-metadata';

import AppError from '@shared/errors/AppError';
import CreateProductService from './CreateProductService';
import FakeProductsRepository from '../repositories/fakes/FakeProductsRepository';

let fakeProductsRepository: FakeProductsRepository;
let createProductService: CreateProductService;

describe('CreateCustomer', () => {
  beforeEach(() => {
    fakeProductsRepository = new FakeProductsRepository();

    createProductService = new CreateProductService(fakeProductsRepository);
  });

  it('should be able to create a new product', async () => {
    const product = await createProductService.execute({
      name: 'caneca',
      price: 50,
      quantity: 1,
    });

    expect(product).toHaveProperty('id');
    expect(product.name).toBe('caneca');
  });

  it('should not be able to create a duplicated product', async () => {
    await fakeProductsRepository.create({
      name: 'caneca',
      price: 50,
      quantity: 1,
    });

    await expect(
      createProductService.execute({
        name: 'caneca',
        price: 50,
        quantity: 1,
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
