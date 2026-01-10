namespace apm;

using { cuid, managed } from '@sap/cds/common';


entity Artists : cuid, managed {
  name            : String(120);
  genre           : String(60);
  country         : String(60);
  popularityScore : Integer;
  bio             : String(2000);

  spotifyUrl      : String(255);
  instagramUrl    : String(255);

  reviews         : Composition of many Reviews on reviews.artist = $self;
  performances    : Association to many Performances on performances.artist = $self;
}

entity Reviews : cuid, managed {
  artist        : Association to Artists;
  rating        : Integer;
  comment       : String(500);
  reviewDate    : Date;
  customerName  : String(120);
}

entity FestivalDays : cuid, managed {
  label : String(40);
  date  : Date;
}

entity Stages : cuid, managed {
  name : String(80);
}

entity Performances : cuid, managed {
  artist    : Association to Artists;
  day       : Association to FestivalDays;
  stage     : Association to Stages;
  startTime : Time;
  endTime   : Time;
}



type OrderStatus : String enum {
  OPEN;
  PAID;
  CANCELLED;
}

type OrderType : String enum {
  TICKETS;
  MERCH;
  FOOD;
}

entity Customers : cuid, managed {
  name  : String(120);
  email : String(160);
}

entity Orders : cuid, managed {
  orderDate : Date;
  status    : OrderStatus;
  type      : OrderType;

  customer  : Association to Customers;

  items     : Composition of many OrderItems on items.order = $self;

  total     : Decimal(9,2);
}

entity OrderItems : cuid, managed {
  order     : Association to Orders;

  name      : String(120);
  qty       : Integer;
  unitPrice : Decimal(9,2);
  lineTotal : Decimal(9,2);
}
