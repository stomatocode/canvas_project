
// this creates an instance from the DOM element, including the canvas
$(function() {
  app = new App('container');
});


// this creates a constructor for a new instance of the canvas object
function App(locator, shapes) {
  this.shapes = shapes || new Shapes();
  this.canvasView = new CanvasView(locator, this.shapes);
}

// I honestly have no idea
Eventable = {
  on: function(event, callback) {
    $(this).on(event, callback);
  },
  trigger: function(event, data) {
    $(this).trigger(event, data);
  }
};

// collection (model)
function Shapes() {
  this.shapes = [];
}

// different form of JS inheritance,
// still unclear on what this is doing
$.extend(Shapes.prototype, Eventable);

// defining the addition of a shape to the collection
Shapes.prototype.add = function(shape) {
  this.shapes.push(shape);
  this.trigger('added', shape);
};

// Defining the CanvasView object and properties and behavior
function CanvasView(locator, shapes) {
  this.element = $('#' + locator);
  this.shapes = shapes;
  this.shapeViews = [];
  this.stage = new Kinetic.Stage({
    container: locator,
    width: 960,
    height: 480
  });

  // create the elements that Kinetic needs to render things with
  this.layer = new Kinetic.Layer();
  this.stage.add(this.layer);

  // detects cursor clicking down and uses Kinetic stage to get cursor
  // position; defines new shape from
  var self = this;
  this.stage.on('mousedown', function(e) {
    var mousePos = self.stage.getMousePosition();
    self.currentShape = new Shape({ x: mousePos.x, y: mousePos.y, height: 0, width: 0 });
    self.shapes.add(self.currentShape);
  });

  // 
  this.stage.on('mousemove', function(e) {
    if(!self.currentShape) { return; }
    var mousePos = self.stage.getMousePosition();
    self.currentShape.update({ width: mousePos.x - self.currentShape.x, height: mousePos.y - self.currentShape.y });
  });

  this.stage.on('mouseup', function(e) {
    self.currentShape = undefined;
  });

  shapes.on('added', function(e, shape) {
    self.add(shape);
  });
}

CanvasView.prototype.add = function(shape) {
  var shapeView = new ShapeView(shape);
  this.shapeViews.push(shapeView);
  this.layer.add(shapeView.kineticShape);
  this.layer.draw();
};

function ShapeView(shape) {

  this.kineticShape = new Kinetic.Rect({
    x: shape.x,
    y: shape.y,
    width: shape.width,
    height: shape.height,
    fill: 'red'
  });
  var self = this;
  shape.on('updated', function() {
    self.kineticShape.setX(this.x);
    self.kineticShape.setY(this.y);
    self.kineticShape.setWidth(this.width);
    self.kineticShape.setHeight(this.height);
    self.kineticShape.getLayer().draw();
  });
}


function Shape(attributes) {
  this.update(attributes);
}

$.extend(Shape.prototype, Eventable);

Shape.prototype.update = function(attributes) {
  attributes = attributes || {};
  $.extend(this, attributes);
  this.trigger('updated');
};



