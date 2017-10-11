let customerId = 0;
let employerId = 0;
let mealId = 0;
let deliveryId = 0;
let store = { customers: [], employers: [], meals: [], deliveries: [] };

class Customer {
  constructor(name, employer) {
    this.name = name;
    this.id = ++customerId;
    if (employer) {
      this.employerId = employer.id;
    }
    store.customers.push(this);
  }

  deliveries() {
    return store.deliveries.filter(
      function(delivery) {
        return delivery.customerId === this.id;
      }.bind(this)
    );
  }

  meals() {
    return this.deliveries().map(
      function(delivery) {
        return delivery.meal();
      }.bind(this)
    );
  }

  totalSpent() {
    return this.meals().reduce(function(acc, meal, index, array) {
      return (acc += meal.price);
    }, 0);
  }
}

class Meal {
  constructor(title, price) {
    this.title = title;
    if (price) {
      this.price = price;
    }
    this.id = ++mealId;
    store.meals.push(this);
  }

  deliveries() {
    return store.deliveries.filter(
      function(delivery) {
        return delivery.mealId === this.id;
      }.bind(this)
    );
  }

  //has many through - we're going through the filtered join table and mapping the customers based on their ID
  customers() {
    return this.deliveries().map(
      function(delivery) {
        return delivery.customer(); //calling delivery class function so we get the customer object
      }.bind(this)
    );
  }

  static byPrice() {
    return store.meals.sort(function(meal1, meal2) {
      return meal2.price - meal1.price; //sort descending
    });
  }
}

class Delivery {
  constructor(meal, customer) {
    if (meal) {
      this.mealId = meal.id;
    }
    if (customer) {
      this.customerId = customer.id;
    }
    this.id = ++deliveryId;
    store.deliveries.push(this);
  }

  customer() {
    return store.customers.find(
      function(customer) {
        return customer.id === this.customerId;
      }.bind(this) //bind the inner function to this (this is window since it's a callback)
    );
  }

  meal() {
    return store.meals.find(
      function(meal) {
        return meal.id === this.mealId;
      }.bind(this) //bind the inner function to this (this is window since it's a callback)
    );
  }
}

class Employer {
  constructor(name) {
    this.name = name;
    this.id = ++employerId;
    store.employers.push(this);
  }

  employees() {
    return store.customers.filter(
      function(customer) {
        return customer.employerId === this.id;
      }.bind(this)
    );
  }

  deliveries() {
    return this.employees().reduce(function(acc, employee) {
      for (const el of employee.deliveries()) {
        acc.push(el); //you don't return this b/c for/of isn't a function and you don't want to exit the loop
      }
      return acc;
    }, []);
  }

  meals() {
    const array = this.deliveries().map(function(delivery) {
      return delivery.meal(); //calling meal function from Delivery class
    });
    return [...new Set(array)]; //creates a unique array
  }

  mealTotals() {
    const meals = this.deliveries().map(delivery => delivery.meal());
    return meals.reduce(function(acc, meal) {
      acc[meal.id] = (acc[meal.id] || 0) + 1;
      return acc;
    }, {});
  }
}
