using apm from '../db/schema';

service FestivalService {
  entity Artists as projection on apm.Artists;
  entity Reviews as projection on apm.Reviews;
  entity Performances as projection on apm.Performances;
  entity FestivalDays as projection on apm.FestivalDays;
  entity Stages as projection on apm.Stages;

  entity Orders as projection on apm.Orders;
  entity OrderItems as projection on apm.OrderItems;
  entity Customers as projection on apm.Customers;
}
