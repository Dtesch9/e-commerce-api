import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import IOrdersRepository from '../repositories/IOrdersRepository';
import Order from '../infra/typeorm/entities/Order';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateProductService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('Customer not found');
    }

    const productsIds = products.map(product => ({ id: product.id }));

    const productsFromIds = await this.productsRepository.findAllById(
      productsIds,
    );

    if (productsFromIds.length < products.length) {
      throw new AppError('Invalid Product');
    }

    const hasInvalidQuantity = products.find(product => {
      return productsFromIds.find(
        stockProduct => product.quantity > stockProduct.quantity,
      );
    });

    if (hasInvalidQuantity) {
      throw new AppError(
        `Product with ${hasInvalidQuantity.quantity} amount out of stock`,
      );
    }

    const orderProducts = await this.productsRepository.updateQuantity(
      products,
    );

    const order = await this.ordersRepository.create({
      customer,
      products: orderProducts.map(product => ({
        product_id: product.id,
        price: product.price,
        quantity: product.quantity,
      })),
    });

    return order;
  }
}

export default CreateProductService;
