using apm from '../db/schema';

@path: 'festival'
service FestivalService {

  entity Artists       as projection on apm.Artists;
  entity Reviews       as projection on apm.Reviews;
  entity Performances  as projection on apm.Performances;
  entity FestivalDays  as projection on apm.FestivalDays;
  entity Stages        as projection on apm.Stages;

  entity Orders        as projection on apm.Orders;
  entity OrderItems    as projection on apm.OrderItems;
  entity Customers     as projection on apm.Customers;

@readonly
entity Leaderboard as select from Reviews as r
  inner join Artists as a on r.artist.ID = a.ID
{
  key a.ID as artistID,
      a.name as artistName,

      // expliciet type geven
      cast(avg(r.rating) as Decimal(3,2)) as avgRating,
      cast(count(1)      as Integer)     as reviewCount
}
group by a.ID, a.name;


}
