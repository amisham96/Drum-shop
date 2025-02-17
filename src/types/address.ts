type AddressInput = {
  name: string,
  phone: string,
  pinCode: string,
  address: string,
  city: string,
  state: string,
  landmark?: string,
  addressType: string
}

type Address = {
  _id: string,
  name: string,
  phone: string,
  pinCode: string,
  address: string,
  city: string,
  state: string,
  landmark?: string,
  addressType: string
}

export  {
  type AddressInput,
  type Address,
}
