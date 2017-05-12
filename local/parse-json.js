var Sequelize = require('sequelize');



var sequelize = new Sequelize('', '', '', {
  host: 'sqlite://',
  dialect: 'sqlite',
  storage: '../dev.sqlite',
  logging: console.log,
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
});

let Item = sequelize.define('Item', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true,
  },
  notes: Sequelize.TEXT,
  location: Sequelize.STRING,
  cost: Sequelize.STRING,
}, {
  timestamps: false
});

let Craft = sequelize.define('Craft', {
  item_name: {
    type: Sequelize.STRING,
    references: {
      model: Item,
      key: 'name'
    }
  },
  resource: {
    type: Sequelize.STRING,
    references: {
      model: Item,
      key: 'name',
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
    }
  },
  count: {
    type: Sequelize.INTEGER,
    default: 1
  }
},{
  timestamps: false,
});

let Alias = sequelize.define('Alias', {
  item_name: {
    type: Sequelize.STRING,
    references: {
      model: Item,
      key: 'name',
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
    }
  },
  alias: {
    type: Sequelize.STRING,
    references: {
      model: Item,
      key: 'name',
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
    }
  }
}, {
  timestamps: false,
});


var jsonItems = require('./weap_aff.json');



function loadData(jsonItems) {
  return new Promise((resolve, reject) => {

  });
}
var aliases = [];



var items = [];




function createAlias(name, notes) {

  if (notes.toLowerCase().includes('organ')) {
    var organAlias = {};
    organAlias.item_name = name;
    organAlias.alias = 'monster organ';
    aliases.push(organAlias);
  }

  if (notes.toLowerCase().includes('bone')) {
    var boneAlias = {};
    boneAlias.item_name = name;
    boneAlias.alias = 'bone';
    aliases.push(boneAlias);
  }

  if (notes.toLowerCase().includes('hide')) {
    var hideAlias = {};
    hideAlias.item_name = name;
    hideAlias.alias = 'hide';
    aliases.push(hideAlias);
  }
}



const re = /(?:(\d+)\s*x\s*)?(.*)/;
const craftList = [];

function createDefaultItems() {
  ['bone', 'organ', 'hide', 'scrap']
    .forEach(base => {
      items.push({name: base, notes: 'default item'});
});

}


function crafts(item) {
  if (item.craft) {
    item.craft.toLowerCase()
      .split(', ')
      .map((ingredient) => ingredient.match(re))
      .filter(([, , resource]) => items.some((item) => resource.includes(item.name)))
      .forEach(([, count, resource]) => craftList.push({item_name: item.name, count, resource}));
  }
}
createDefaultItems();
jsonItems.forEach(obj=> {
  var item = {};
  item.name = obj.Item.toLowerCase();
  item.notes = obj.Notes;
  item.location = obj.Location === '---' ? '' : obj.Location.toLowerCase();
  createAlias(item.name, item.notes);
  item.craft = obj.Craft;
  crafts(item);
  items.push(item);
});

// const set = new Set();
// items.forEach(item => {
//   if (set.has(item.name)) {
//     console.log(item.name);
//   }
//   set.add(item.name);
// });

const set = new Set(items.map(item => item.name));

let cleanCraftList = craftList.filter(item => {
    return set.has(item.resource)
});

const tables = [Item, Alias, Craft];

//load data
var schemaInit = tables.map(table =>
  table.drop().then(() => table.sync())
);

Promise.all(schemaInit).then(() =>
  Item.bulkCreate(items)
).then(() =>
  Alias.bulkCreate(aliases)
)
  .then(() =>
    Craft.bulkCreate(cleanCraftList));