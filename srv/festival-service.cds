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
entity Leaderboard as select from Artists as a
  left join Reviews as r on r.artist.ID = a.ID
{
  key a.ID as artistID,
      a.name as artistName,
      a.genre as genre,

      cast(coalesce(avg(r.rating), 0) as Decimal(3,2)) as avgRating,
      cast(count(r.ID)               as Integer)       as reviewCount
}
group by a.ID, a.name, a.genre;




}
