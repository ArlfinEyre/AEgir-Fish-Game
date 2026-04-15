export function checkCollision(obj1, obj2) {
  const rect1 = {
    x: obj1.logicalX - obj1.width / 2,
    y: obj1.logicalY - obj1.height / 2,
    width: obj1.width,
    height: obj1.height,
  };
  const rect2 = {
    x: obj2.logicalX - obj2.width / 2,
    y: obj2.logicalY - obj2.height / 2,
    width: obj2.width,
    height: obj2.height,
  };

  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}
