from xerial.Record import Record
from xerial.DateColumn import DateColumn
from xerial.IntegerColumn import IntegerColumn

class OrderItem (Record):
    quantity = IntegerColumn()
    order = IntegerColumn(foreignKey="Order.id")
    product = IntegerColumn(foreignKey="Product.id")