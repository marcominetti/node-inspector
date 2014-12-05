var inspector = require('../front-end/inspector.json');

module.exports = function(injections) {
  injections.forEach(function(injection) {
    var items = inspector.filter(equalTo(injection, 'name'));
    var exists = items.length > 0;

    if (injection.type == 'exclude') {
      if (exists) return;
      items.forEach(function(item) {
        inspector.splice(inspector.indexOf(item), 1);
      });
    } else {
      if (exists) return;
      inspector.unshift(injection);
    }
  });

  return inspector;
};

function equalTo(target, key) {
  return function(item) {
    return target[key] === item[key];
  };
}