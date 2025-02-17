import { ProductType } from './product'

type ArtistType = {
  name: string,
  title: string,
  link ?: string,
}

interface EventType {
  _id: string,
  name: string,
  date: string,
  time: string,
  location: string,
  status: string,
  details: string,
  featuredArtists: ArtistType[],
  featuredProducts: string[],

  socialLinks: {
    instagram: string,
    facebook: string,
    youtube: string,
    x: string,
  },

  poster: string,
  media: string[]
}

type EventWithFeaturedProducts = Omit<EventType, 'featuredProducts'> & {
  featuredProducts: ProductType[],
}

export {
  type ArtistType,
  type EventType,
  type EventWithFeaturedProducts,
}