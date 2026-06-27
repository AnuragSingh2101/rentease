import { Request, Response } from 'express';
import { Cart } from '../models/Cart';
import { Product } from '../models/Product';


export const getCart = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name monthlyRent deposit images category availableQuantity tenureOptions'
    });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};


export const addToCart = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const { productId, quantity = 1, tenure = 3 } = req.body;

    if (!productId) {
      res.status(400).json({ success: false, message: 'Please provide a product ID' });
      return;
    }

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }


    if (product.vendor.toString() === req.user._id.toString() && req.user.role !== 'admin') {
      res.status(400).json({ success: false, message: 'You cannot add your own product to cart' });
      return;
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }


    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId.toString() && item.tenure === Number(tenure)
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += Number(quantity);
    } else {
      cart.items.push({
        product: productId,
        quantity: Number(quantity),
        tenure: Number(tenure)
      } as any);
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name monthlyRent deposit images category availableQuantity tenureOptions'
    });

    res.status(200).json({
      success: true,
      data: populatedCart
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};


export const updateCartItem = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const { quantity, tenure } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      res.status(404).json({ success: false, message: 'Cart not found' });
      return;
    }

    const item = cart.items.find((item) => (item as any)._id.toString() === req.params.itemId);
    if (!item) {
      res.status(404).json({ success: false, message: 'Cart item not found' });
      return;
    }

    if (quantity !== undefined) {
      item.quantity = Number(quantity);
    }

    if (tenure !== undefined) {
      item.tenure = Number(tenure);
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name monthlyRent deposit images category availableQuantity tenureOptions'
    });

    res.status(200).json({
      success: true,
      data: populatedCart
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};


export const removeFromCart = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      res.status(404).json({ success: false, message: 'Cart not found' });
      return;
    }

    cart.items = cart.items.filter((item) => (item as any)._id.toString() !== req.params.itemId);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name monthlyRent deposit images category availableQuantity tenureOptions'
    });

    res.status(200).json({
      success: true,
      data: populatedCart
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};


export const clearCart = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      res.status(404).json({ success: false, message: 'Cart not found' });
      return;
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
