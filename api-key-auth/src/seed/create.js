const mongoose = require("mongoose");
const Presidents = require("../module/world-presidents/presidents.model"); // Update path accordingly
const presidentsData = [
  {
    name: "George Washington",
    country: "United States",
    environment: "test",
    year_in_office: ["1789", "1797"],
  },
  {
    name: "John Adams",
    country: "United States",
    environment: "test",
    year_in_office: ["1797", "1801"],
  },
  {
    name: "Thomas Jefferson",
    country: "United States",
    environment: "test",
    year_in_office: ["1801", "1809"],
  },
  {
    name: "James Madison",
    country: "United States",
    year_in_office: ["1809", "1817"],
  },
  {
    name: "James Monroe",
    country: "United States",
    year_in_office: ["1817", "1825"],
  },
  {
    name: "John Quincy Adams",
    country: "United States",
    year_in_office: ["1825", "1829"],
  },
  {
    name: "Andrew Jackson",
    country: "United States",
    year_in_office: ["1829", "1837"],
  },
  {
    name: "Martin Van Buren",
    country: "United States",
    year_in_office: ["1837", "1841"],
  },
  {
    name: "William Henry Harrison",
    country: "United States",
    year_in_office: ["1841"],
  },
  {
    name: "John Tyler",
    country: "United States",
    year_in_office: ["1841", "1845"],
  },
  {
    name: "James K. Polk",
    country: "United States",
    year_in_office: ["1845", "1849"],
  },
  {
    name: "Zachary Taylor",
    country: "United States",
    year_in_office: ["1849", "1850"],
  },
  {
    name: "Millard Fillmore",
    country: "United States",
    year_in_office: ["1850", "1853"],
  },
  {
    name: "Franklin Pierce",
    country: "United States",
    year_in_office: ["1853", "1857"],
  },
  {
    name: "James Buchanan",
    country: "United States",
    year_in_office: ["1857", "1861"],
  },
  {
    name: "Abraham Lincoln",
    country: "United States",
    year_in_office: ["1861", "1865"],
  },
  {
    name: "Andrew Johnson",
    country: "United States",
    year_in_office: ["1865", "1869"],
  },
  {
    name: "Ulysses S. Grant",
    country: "United States",
    year_in_office: ["1869", "1877"],
  },
  {
    name: "Rutherford B. Hayes",
    country: "United States",
    year_in_office: ["1877", "1881"],
  },
  {
    name: "James A. Garfield",
    country: "United States",
    year_in_office: ["1881"],
  },
  {
    name: "Chester A. Arthur",
    country: "United States",
    year_in_office: ["1881", "1885"],
  },
  {
    name: "Grover Cleveland",
    country: "United States",
    year_in_office: [
      "1885",
      "1889",
      "1893",
      "1897",
    ],
  },
  {
    name: "Benjamin Harrison",
    country: "United States",
    year_in_office: ["1889", "1893"],
  },
  {
    name: "William McKinley",
    country: "United States",
    year_in_office: ["1897", "1901"],
  },
  {
    name: "Theodore Roosevelt",
    country: "United States",
    year_in_office: ["1901", "1909"],
  },
  {
    name: "William Howard Taft",
    country: "United States",
    year_in_office: ["1909", "1913"],
  },
  {
    name: "Woodrow Wilson",
    country: "United States",
    year_in_office: ["1913", "1921"],
  },
  {
    name: "Warren G. Harding",
    country: "United States",
    year_in_office: ["1921", "1923"],
  },
  {
    name: "Calvin Coolidge",
    country: "United States",
    year_in_office: ["1923", "1929"],
  },
  {
    name: "Herbert Hoover",
    country: "United States",
    year_in_office: ["1929", "1933"],
  },
  {
    name: "Franklin D. Roosevelt",
    country: "United States",
    year_in_office: ["1933", "1945"],
  },
  {
    name: "Harry S. Truman",
    country: "United States",
    year_in_office: ["1945", "1953"],
  },
  {
    name: "Dwight D. Eisenhower",
    country: "United States",
    year_in_office: ["1953", "1961"],
  },
  {
    name: "John F. Kennedy",
    country: "United States",
    year_in_office: ["1961", "1963"],
  },
  {
    name: "Lyndon B. Johnson",
    country: "United States",
    year_in_office: ["1963", "1969"],
  },
  {
    name: "Richard Nixon",
    country: "United States",
    year_in_office: ["1969", "1974"],
  },
  {
    name: "Gerald Ford",
    country: "United States",
    year_in_office: ["1974", "1977"],
  },
  {
    name: "Jimmy Carter",
    country: "United States",
    year_in_office: ["1977", "1981"],
  },
  {
    name: "Ronald Reagan",
    country: "United States",
    year_in_office: ["1981", "1989"],
  },
  {
    name: "George H.W. Bush",
    country: "United States",
    year_in_office: ["1989", "1993"],
  },
  {
    name: "Bill Clinton",
    country: "United States",
    year_in_office: ["1993", "2001"],
  },
  {
    name: "George W. Bush",
    country: "United States",
    year_in_office: ["1901", "2009"],
  },
  {
    name: "Barack Obama",
    country: "United States",
    year_in_office: ["2009", "2017"],
  },
  {
    name: "Donald Trump",
    country: "United States",
    year_in_office: [
      "2017",
      "2021",
      "2025",
      "2029",
    ],
  },
  {
    name: "Joe Biden",
    country: "United States",
    year_in_office: ["2021", "2025"],
  },
  {
    name: "Nelson Mandela",
    country: "South Africa",
    year_in_office: ["1994", "1999"],
  },
  {
    name: "Charles de Gaulle",
    country: "France",
    year_in_office: ["1959", "1969"],
  },
  {
    name: "Emmanuel Macron",
    country: "France",
    year_in_office: ["2017", "2027"],
  },
  {
    name: "Michael D. Higgins",
    country: "Ireland",
    year_in_office: ["2011", "2025"],
  },
  {
    name: "Joko Widodo",
    country: "Indonesia",
    year_in_office: ["2014", "2024"],
  },
];
async function seedDB() {
  try {
    await mongoose.connect(
      "mongodb://localhost:27017/api-key-auth-ubu",
    );

    // Optional: Clear existing data before seeding
    await Presidents.deleteMany({});

    await Presidents.insertMany(
      presidentsData,
    );
    console.log(
      "50 Presidents successfully seeded! 🎉",
    );
  } catch (error) {
    console.error(
      "Error seeding database:",
      error,
    );
  } finally {
    mongoose.connection.close();
  }
}

seedDB();
