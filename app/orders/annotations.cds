using FestivalService as service from '../../srv/festival-service';

annotate service.Orders with @(
  UI: {
    HeaderInfo: {
      TypeName: 'Order',
      TypeNamePlural: 'Orders',
      Title: { Value: customer.name },
      Description: { Value: orderDate }
    },

    LineItem: [
      { $Type: 'UI.DataField', Value: orderDate, Label: 'Orderdatum' },
      { $Type: 'UI.DataField', Value: customer.name, Label: 'Klant' },
      { $Type: 'UI.DataField', Value: type, Label: 'Ordertype' },
      { $Type: 'UI.DataField', Value: status, Label: 'Status' },
      { $Type: 'UI.DataField', Value: total, Label: 'Totaal' }
    ],

    SelectionFields: [ customer, status, type ],

    PresentationVariant: {
      SortOrder: [
        { Property: orderDate, Descending: true }
      ]
    }
  }
);
annotate service.Orders with @(
  UI: {
    Facets: [
      { $Type: 'UI.ReferenceFacet', Label: 'Order', Target: '@UI.FieldGroup#Order' },
      { $Type: 'UI.ReferenceFacet', Label: 'Items', Target: 'items/@UI.LineItem' }
    ],
    FieldGroup#Order: {
      Data: [
        { $Type: 'UI.DataField', Value: orderDate, Label: 'Orderdatum' },
        { $Type: 'UI.DataField', Value: customer.name, Label: 'Klant' },
        { $Type: 'UI.DataField', Value: type, Label: 'Ordertype' },
        { $Type: 'UI.DataField', Value: status, Label: 'Status' },
        { $Type: 'UI.DataField', Value: total, Label: 'Totaal' }
      ]
    }
  }
);

annotate service.OrderItems with @(
  UI: {
    LineItem: [
      { $Type: 'UI.DataField', Value: name, Label: 'Naam' },
      { $Type: 'UI.DataField', Value: qty, Label: 'Aantal' },
      { $Type: 'UI.DataField', Value: unitPrice, Label: 'Unit' },
      { $Type: 'UI.DataField', Value: lineTotal, Label: 'Lijn totaal' }
    ]
  }
);
