import { Request, Response } from 'express';
import { Rental } from '../models/Rental';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { Maintenance } from '../models/Maintenance';


export const getAdminAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Not authorized as admin' });
      return;
    }


    const totalUsersCount = await User.countDocuments();
    const activeRentalsCount = await Rental.countDocuments({ status: 'Active' });
    const pendingRentalsCount = await Rental.countDocuments({ status: 'Pending' });


    const allRentals = await Rental.find({ status: { $ne: 'Cancelled' } });
    const totalRevenue = allRentals.reduce((sum, rental) => sum + (rental.totalPrice || 0), 0);


    const customerCount = await User.countDocuments({ role: { $in: ['customer', 'user'] } });
    const vendorCount = await User.countDocuments({ role: 'vendor' });
    const adminCount = await User.countDocuments({ role: 'admin' });

    const userDistribution = [
      { name: 'Customers', value: customerCount },
      { name: 'Vendors', value: vendorCount },
      { name: 'Admins', value: adminCount }
    ];


    const rentalUsers = await Rental.aggregate([
      { $group: { _id: '$user', count: { $sum: 1 } } }
    ]);
    const totalRentingCustomers = rentalUsers.length;
    const returningCustomers = rentalUsers.filter(ru => ru.count > 1).length;
    const customerRetentionRate = totalRentingCustomers > 0
      ? Math.round((returningCustomers / totalRentingCustomers) * 100)
      : 0;


    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyRevenueMap: { [key: string]: number } = {};
    const monthlyRentalsMap: { [key: string]: number } = {};


    const last6Months: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      last6Months.push(label);
      monthlyRevenueMap[label] = 0;
      monthlyRentalsMap[label] = 0;
    }

    allRentals.forEach(rental => {
      const date = new Date(rental.startDate);
      const label = `${months[date.getMonth()]} ${date.getFullYear().toString().slice(-2)}`;
      if (monthlyRevenueMap[label] !== undefined) {
        monthlyRevenueMap[label] += rental.totalPrice || 0;
        monthlyRentalsMap[label] += 1;
      }
    });

    const monthlyRevenueData = last6Months.map(label => ({
      month: label,
      Revenue: Math.round(monthlyRevenueMap[label]),
      Rentals: monthlyRentalsMap[label]
    }));


    const activeLeases = await Rental.find({ status: 'Active' }).populate({
      path: 'product',
      select: 'category'
    });
    const allProducts = await Product.find({});

    const categories = ['Electronics', 'Furniture', 'Appliances', 'Fitness', 'Others'];
    const activeQtyMap: { [key: string]: number } = {};
    const totalQtyMap: { [key: string]: number } = {};

    categories.forEach(cat => {
      activeQtyMap[cat] = 0;
      totalQtyMap[cat] = 0;
    });


    activeLeases.forEach((rental: any) => {
      if (rental.product && rental.product.category) {
        const cat = categories.includes(rental.product.category) ? rental.product.category : 'Others';
        activeQtyMap[cat] += rental.quantity || 0;
      }
    });


    allProducts.forEach(prod => {
      const cat = categories.includes(prod.category) ? prod.category : 'Others';
      totalQtyMap[cat] += prod.availableQuantity || 0;
    });

    const utilizationData = categories.map(cat => {
      const active = activeQtyMap[cat];
      const totalStock = totalQtyMap[cat] + active;
      const rate = totalStock > 0 ? Math.round((active / totalStock) * 100) : 0;
      return {
        category: cat,
        Rented: active,
        Total: totalStock,
        Utilization: rate
      };
    });


    const resolvedTickets = await Maintenance.find({ status: 'Resolved' });
    let totalResolutionHours = 0;
    resolvedTickets.forEach(ticket => {
      const diffMs = ticket.updatedAt.getTime() - ticket.createdAt.getTime();
      totalResolutionHours += diffMs / (1000 * 60 * 60);
    });
    const avgResolutionTimeHours = resolvedTickets.length > 0
      ? Math.round(totalResolutionHours / resolvedTickets.length)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        cards: {
          totalUsers: totalUsersCount,
          activeRentals: activeRentalsCount,
          pendingRequests: pendingRentalsCount,
          revenue: Math.round(totalRevenue)
        },
        userDistribution,
        customerRetentionRate,
        monthlyRevenue: monthlyRevenueData,
        productUtilization: utilizationData,
        avgMaintenanceResolutionHours: avgResolutionTimeHours
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
