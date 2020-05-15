import { uuid } from 'uuidv4';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../../infra/typeorm/entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private products: Product[] = [];

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = new Product();

    Object.assign(product, {
      id: uuid(),
      name,
      price,
      quantity,
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    this.products.push(product);

    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const product = this.products.find(
      findProduct => findProduct.name === name,
    );

    return product;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const allProductsHavingTheseIds = this.products.map(storedProduct => {
      const found = products.find(
        productId => productId.id === storedProduct.id,
      ) as Product;

      return found && storedProduct;
    });

    return allProductsHavingTheseIds;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const order: Product[] = [];

    const updatedProducts = this.products.map(toUpdate => {
      const results = products.find(
        requiredQuantity => requiredQuantity.id === toUpdate.id,
      );

      if (results) {
        const { quantity: orderedQuantity } = results;

        Object.assign(toUpdate, {
          quantity: toUpdate.quantity - orderedQuantity,
        });

        order.push({
          ...toUpdate,
          quantity: orderedQuantity,
        });
      }

      return toUpdate;
    });

    this.products = updatedProducts;

    return order;
  }
}

export default ProductsRepository;
