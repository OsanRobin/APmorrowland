using apm from '../db/schema';

service FestivalService {
  entity Artists       as projection on apm.Artists;
  entity Reviews       as projection on apm.Reviews;
  entity FestivalDays  as projection on apm.FestivalDays;
  entity Stages        as projection on apm.Stages;
  entity Performances  as projection on apm.Performances;
}
