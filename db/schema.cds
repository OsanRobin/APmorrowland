namespace apm;

using { cuid, managed } from '@sap/cds/common';

entity Artists : cuid, managed {
  name            : String(120);
  genre           : String(60);
  country         : String(60);
  popularityScore : Integer;
  bio             : String(2000);

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
