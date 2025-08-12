'use client';

import { useState } from 'react';
import UserHeader from '@/components/UserHeader';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLocationStore } from '@/store/location.store';
import { MapPin, Star, ArrowRight, LocateIcon, Send, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import React from 'react'; // Added missing import for React

// Carousel images for welcome section
const CAROUSEL_IMAGES = [
  {
    id: 1,
    title: 'Welcome to QuickCourt',
    subtitle: 'Discover and book the best sports facilities in your area',
    image: '🏟️',
    bgColor: 'from-primary/10 to-secondary/10',
  },
  {
    id: 2,
    title: 'Book Your Court',
    subtitle: 'From tennis courts to football grounds, find your perfect match',
    image: '🎾',
    bgColor: 'from-blue-500/10 to-green-500/10',
  },
  {
    id: 3,
    title: 'Stay Active',
    subtitle: 'Join matches and stay active in your community',
    image: '⚽',
    bgColor: 'from-orange-500/10 to-red-500/10',
  },
];

// Sports categories with icons and colors
const SPORTS_CATEGORIES = [
  {
    id: 'tennis',
    name: 'Tennis',
    icon: '🎾',
    color: 'bg-pink-100 text-pink-800',
    venues: 24,
  },
  {
    id: 'basketball',
    name: 'Basketball',
    icon: '🏀',
    color: 'bg-orange-100 text-orange-800',
    venues: 18,
  },
  {
    id: 'football',
    name: 'Football',
    icon: '⚽',
    color: 'bg-blue-100 text-blue-800',
    venues: 32,
  },
  {
    id: 'badminton',
    name: 'Badminton',
    icon: '🏸',
    color: 'bg-cyan-100 text-cyan-800',
    venues: 28,
  },
  {
    id: 'squash',
    name: 'Squash',
    icon: '🥎',
    color: 'bg-sky-100 text-sky-800',
    venues: 12,
  },
  {
    id: 'table-tennis',
    name: 'Table Tennis',
    icon: '🏓',
    color: 'bg-rose-100 text-rose-800',
    venues: 16,
  },
  {
    id: 'swimming',
    name: 'Swimming',
    icon: '🏊',
    color: 'bg-yellow-100 text-yellow-800',
    venues: 8,
  },
  {
    id: 'cricket',
    name: 'Cricket',
    icon: '🏏',
    color: 'bg-pink-100 text-pink-800',
    venues: 22,
  },
];

// Popular cities with venue counts
const POPULAR_CITIES = [
  { name: 'Mumbai', venues: 45, selected: false },
  { name: 'Pune', venues: 32, selected: false },
  { name: 'Delhi', venues: 38, selected: false },
  { name: 'Ahmedabad', venues: 28, selected: false },
];

// Popular venues data
const POPULAR_VENUES = [
  {
    id: 1,
    name: 'Elite Sports Complex',
    sport: 'Multi-Sport',
    location: 'Bandra West, Mumbai',
    rating: 4.8,
    reviews: 124,
    price: 800,
    image: '/api/placeholder/300/200',
    amenities: ['Parking', 'Shower', 'Equipment'],
    equipmentAvailable: true,
  },
  {
    id: 2,
    name: 'Royal Tennis Academy',
    sport: 'Tennis',
    location: 'Juhu, Mumbai',
    rating: 4.6,
    reviews: 89,
    price: 1200,
    image: '/api/placeholder/300/200',
    amenities: ['Coach', 'Equipment', 'Cafe'],
    equipmentAvailable: true,
  },
  {
    id: 3,
    name: 'Fitness First Arena',
    sport: 'Basketball',
    location: 'Andheri East, Mumbai',
    rating: 4.4,
    reviews: 67,
    price: 600,
    image: '/api/placeholder/300/200',
    amenities: ['Gym', 'Parking', 'Locker'],
    equipmentAvailable: false,
  },
  {
    id: 4,
    name: 'Badminton Pro Center',
    sport: 'Badminton',
    location: 'Powai, Mumbai',
    rating: 4.7,
    reviews: 156,
    price: 500,
    image: '/api/placeholder/300/200',
    amenities: ['AC', 'Equipment', 'Parking'],
    equipmentAvailable: true,
  },
];

export default function UserPage() {
  const { selectedLocation, setLocation } = useLocationStore();
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);

  const handleCitySelect = (cityName: string) => {
    setSelectedCity(cityName);
    setLocation(cityName);
    console.log(`Selected city: ${selectedLocation}`); // For debugging
  };

  const handleUseMyLocation = () => {
    // Simulate getting user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          // For demo purposes, set to Mumbai
          setSelectedCity('Mumbai');
          setLocation('Mumbai');
        },
        () => {
          // Fallback to Mumbai if location access denied
          setSelectedCity('Mumbai');
          setLocation('Mumbai');
        }
      );
    }
  };

  const nextCarousel = () => {
    setCurrentCarouselIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
  };

  const prevCarousel = () => {
    setCurrentCarouselIndex((prev) => (prev - 1 + CAROUSEL_IMAGES.length) % CAROUSEL_IMAGES.length);
  };

  // Auto-advance carousel
  React.useEffect(() => {
    const interval = setInterval(nextCarousel, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className='bg-background min-h-screen'>
      <UserHeader />

      {/* Hero Section with Carousel */}
      <section className='from-primary/5 to-secondary/5 relative bg-gradient-to-br py-16'>
        <div className='container mx-auto px-4'>
          {/* Carousel */}
          <div className='relative overflow-hidden rounded-2xl'>
            <div className='flex transition-transform duration-500 ease-in-out'>
              {CAROUSEL_IMAGES.map((slide, index) => (
                <div
                  key={slide.id + index}
                  className={`w-full flex-shrink-0 bg-gradient-to-br ${slide.bgColor} p-12 text-center`}
                  style={{ transform: `translateX(-${currentCarouselIndex * 100}%)` }}
                >
                  <div className='mb-6 text-8xl'>{slide.image}</div>
                  <h1 className='text-foreground mb-4 text-3xl font-bold md:text-5xl'>{slide.title}</h1>
                  <p className='text-muted-foreground mx-auto max-w-2xl text-lg md:text-xl'>{slide.subtitle}</p>
                </div>
              ))}
            </div>

            {/* Carousel Navigation */}
            <button
              onClick={prevCarousel}
              className='absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-lg transition-all hover:bg-white'
            >
              <ChevronLeft className='h-5 w-5' />
            </button>
            <button
              onClick={nextCarousel}
              className='absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-lg transition-all hover:bg-white'
            >
              <ChevronRight className='h-5 w-5' />
            </button>

            {/* Carousel Indicators */}
            <div className='absolute bottom-4 left-1/2 flex -translate-x-1/2 space-x-2'>
              {CAROUSEL_IMAGES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentCarouselIndex(index)}
                  className={`h-2 w-2 rounded-full transition-all ${
                    index === currentCarouselIndex ? 'bg-primary w-4' : 'bg-white/60'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Location Selection Section */}
      <section className='py-12'>
        <div className='container mx-auto px-4'>
          <div className='mb-8 text-center'>
            <h2 className='text-foreground mb-2 text-2xl font-bold'>Choose Your Location</h2>
            <p className='text-muted-foreground'>Select your city to discover venues near you</p>
          </div>

          {/* Popular Cities */}
          <div className='mb-6 flex flex-wrap justify-center gap-3'>
            {POPULAR_CITIES.map((city) => (
              <Button
                key={city.name}
                variant={selectedCity === city.name ? 'default' : 'outline'}
                size='sm'
                className='h-auto px-4 py-2'
                onClick={() => handleCitySelect(city.name)}
              >
                <div className='text-center'>
                  <div className='font-medium'>{city.name}</div>
                  <div className='text-xs opacity-80'>({city.venues} venues)</div>
                </div>
              </Button>
            ))}
          </div>

          {/* OR Separator */}
          <div className='mb-6 text-center'>
            <span className='text-muted-foreground text-sm'>OR</span>
          </div>

          {/* Use My Location Button */}
          <div className='text-center'>
            <Button
              size='sm'
              className='h-auto bg-yellow-500 px-6 py-2 text-white hover:bg-yellow-600'
              onClick={handleUseMyLocation}
            >
              <Send className='mr-2 h-4 w-4' />
              USE MY LOCATION
              <LocateIcon className='ml-2 h-4 w-4' />
            </Button>
          </div>
        </div>
      </section>

      {/* Sports Categories Section */}
      <section className='bg-muted/30 py-12'>
        <div className='container mx-auto px-4'>
          <div className='mb-8 text-left'>
            <h2 className='text-foreground mb-2 text-2xl font-bold'>Categories</h2>
            <p className='text-muted-foreground'>Explore different sports and find your passion</p>
          </div>

          <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
            {SPORTS_CATEGORIES.map((sport) => (
              <Link key={sport.id} href={`/categories/${sport.id}`}>
                <Card className='group cursor-pointer transition-all duration-300 hover:shadow-lg'>
                  <CardContent className='p-4 text-center'>
                    <div className={`mb-2 text-3xl transition-transform group-hover:scale-110`}>{sport.icon}</div>
                    <h3 className='text-foreground mb-1 text-sm font-medium'>{sport.name}</h3>
                    <Badge variant='secondary' className={`text-xs ${sport.color}`}>
                      {sport.venues} venues
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Venues Section */}
      <section className='py-12'>
        <div className='container mx-auto px-4'>
          <div className='mb-8 text-left'>
            <h2 className='text-foreground mb-2 text-2xl font-bold'>Your Preferred Venues</h2>
            <p className='text-muted-foreground'>Top-rated facilities recommended for you</p>
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
            {POPULAR_VENUES.map((venue) => (
              <Card key={venue.id} className='group cursor-pointer transition-all duration-300 hover:shadow-lg'>
                <div className='bg-muted mb-3 flex aspect-video items-center justify-center rounded-t-lg'>
                  <div className='text-4xl'>🏟️</div>
                </div>
                <CardContent className='p-3'>
                  <div className='mb-2 flex items-start justify-between'>
                    <h3 className='text-foreground group-hover:text-primary text-sm font-semibold transition-colors'>
                      {venue.name}
                    </h3>
                    <Badge variant='outline' className='text-xs'>
                      {venue.sport}
                    </Badge>
                  </div>

                  <div className='text-muted-foreground mb-2 flex items-center text-xs'>
                    <MapPin className='mr-1 h-3 w-3' />
                    {venue.location}
                  </div>

                  <div className='mb-2 flex items-center justify-between'>
                    <div className='flex items-center'>
                      <Star className='mr-1 h-3 w-3 text-yellow-500' />
                      <span className='text-xs font-medium'>{venue.rating}</span>
                      <span className='text-muted-foreground ml-1 text-xs'>({venue.reviews})</span>
                    </div>
                    <div className='text-primary text-sm font-bold'>₹{venue.price}/hr</div>
                  </div>

                  {/* Equipment Available Tag */}
                  {venue.equipmentAvailable && (
                    <div className='mb-2'>
                      <Badge variant='secondary' className='bg-green-100 text-xs text-green-800'>
                        Equipment Available
                      </Badge>
                    </div>
                  )}

                  <div className='mb-3 flex flex-wrap gap-1'>
                    {venue.amenities.slice(0, 2).map((amenity, index) => (
                      <Badge key={index} variant='secondary' className='text-xs'>
                        {amenity}
                      </Badge>
                    ))}
                    {venue.amenities.length > 2 && (
                      <Badge variant='outline' className='text-xs'>
                        +{venue.amenities.length - 2} more
                      </Badge>
                    )}
                  </div>

                  <Button size='sm' className='w-full text-xs'>
                    Book Now
                    <ArrowRight className='ml-1 h-3 w-3 transition-transform group-hover:translate-x-1' />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* View All Venues Button */}
          <div className='mt-8 text-center'>
            <Link href='/venues'>
              <Button variant='outline' size='sm' className='h-auto px-6 py-2'>
                View All Venues
                <ArrowRight className='ml-2 h-4 w-4' />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className='bg-primary/5 py-12'>
        <div className='container mx-auto px-4 text-center'>
          <h2 className='text-foreground mb-4 text-2xl font-bold'>Ready to Get Started?</h2>
          <p className='text-muted-foreground mx-auto mb-6 max-w-2xl'>
            Join thousands of sports enthusiasts who are already booking courts and joining matches through QuickCourt.
            Your next game is just a click away!
          </p>
          <div className='flex flex-col justify-center gap-3 sm:flex-row'>
            <Link href='/venues'>
              <Button size='sm' className='h-auto px-6 py-2'>
                Find Venues Near Me
              </Button>
            </Link>
            <Link href='/matches'>
              <Button variant='outline' size='sm' className='h-auto px-6 py-2'>
                Join a Match
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
