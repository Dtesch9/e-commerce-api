import { getRepository, Repository, In } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = this.ormRepository.create({
      name,
      price,
      quantity,
    });

    await this.ormRepository.save(product);

    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const product = await this.ormRepository.findOne({
      where: { name },
    });

    return product;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const ids = products.map(product => product.id);

    const allProductsHavingIds = await this.ormRepository.find({
      where: {
        id: In(ids),
      },
    });

    return allProductsHavingIds;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const ids = products.map(product => product.id);

    const productsToUpdate = await this.ormRepository.find({
      where: {
        id: In(ids),
      },
    });

    const order: Product[] = [];

    const updatedProducts = productsToUpdate.map(toUpdate => {
      const results = products.find(
        productQuantity => productQuantity.id === toUpdate.id,
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

    await this.ormRepository.save(updatedProducts);

    return order;
  }
}

export default ProductsRepository;
