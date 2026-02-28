import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, CreditCard, Truck } from 'lucide-react';

export default function Home() {
  return (
    <div className="container py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to E-Commerce</h1>
        <p className="text-xl text-muted-foreground mb-8">
          A full-stack microservices application built with NestJS and Next.js
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/products">
            <Button size="lg">Browse Products</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg">Sign In</Button>
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
        <Card>
          <CardHeader>
            <Package className="h-8 w-8 mb-2" />
            <CardTitle>Products</CardTitle>
            <CardDescription>Browse our catalog</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/products">
              <Button variant="outline" className="w-full">View Products</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <ShoppingCart className="h-8 w-8 mb-2" />
            <CardTitle>Shopping Cart</CardTitle>
            <CardDescription>Manage your items</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/cart">
              <Button variant="outline" className="w-full">View Cart</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CreditCard className="h-8 w-8 mb-2" />
            <CardTitle>Secure Payments</CardTitle>
            <CardDescription>Multiple payment methods</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>Coming Soon</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Truck className="h-8 w-8 mb-2" />
            <CardTitle>Fast Shipping</CardTitle>
            <CardDescription>Track your orders</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>Coming Soon</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
