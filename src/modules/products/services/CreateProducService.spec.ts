import 'reflect-metadata';

import AppError from '@shared/errors/AppError';
import CreateCustomerService from './CreateCustomerService';
import FakeCustomersRepository from '../repositories/fakes/FakeCustomersRepository';

let fakeCustomersRepository: FakeCustomersRepository;
let createCustomerService: CreateCustomerService;

describe('CreateCustomer', () => {
  beforeAll(() => {
    fakeCustomersRepository = new FakeCustomersRepository();

    createCustomerService = new CreateCustomerService(fakeCustomersRepository);
  });

  it('should be able to create a new customer', async () => {
    const user = await createCustomerService.execute({
      name: 'Douglas Tesch',
      email: 'douglas@hotmail.com',
    });

    expect(user).toHaveProperty('id');
    expect(user.name).toBe('Douglas Tesch');
    expect(user.email).toBe('douglas@hotmail.com');
  });

  it('should not be able to create a new customer with an email already registered', async () => {
    await fakeCustomersRepository.create({
      name: 'Douglas Tesch',
      email: 'douglas@hotmail.com',
    });

    await expect(
      createCustomerService.execute({
        name: 'Douglas Tesch',
        email: 'douglas@hotmail.com',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
