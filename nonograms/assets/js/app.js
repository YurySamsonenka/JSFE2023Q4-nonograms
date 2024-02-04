import templates from './templates.js';

let size = 5;
const sizeCells = 30;
let chooseComplexity = 'easy';

function getRandomPicture(complexity) {
  const arrPictures = Object.entries(templates[complexity]);
  const indexRandom = Math.floor(arrPictures.length * Math.random());
  console.log(arrPictures[indexRandom][1]);
  return arrPictures[indexRandom][1];
}

let template = getRandomPicture(chooseComplexity);

// Создание кроссворда

const crossword = document.getElementById('crossword');

function createCrossword(sizeMatrix, sizeCell) {
  const matrix = [];
  crossword.style.gridTemplateColumns = `repeat(${sizeMatrix}, ${sizeCell}px)`;

  for (let i = 0; i < sizeMatrix; i += 1) {
    matrix[i] = [];
    for (let j = 0; j < sizeMatrix; j += 1) {
      matrix[i][j] = 0;
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.style.cssText = `
      width: ${sizeCell}px;
      height: ${sizeCell}px;`;
      cell.setAttribute('data-cell', `${i} ${j}`);
      crossword.append(cell);
    }
  }

  return matrix;
}

let curMatrix = createCrossword(size, 30);

// Рассчет ключей

function calculateClues(matrix) {
  const arrayCluesRows = [];
  const arrayCluesCols = [];

  let maxLengthRows = 0;
  let maxLengthCols = 0;

  function countConsecutiveOnes(arr) {
    const result = [];
    let count = 0;

    for (let i = 0; i < size; i++) {
      if (arr[i] === 1) {
        count += 1;
      } else if (count > 0) {
        result.push(count);
        count = 0;
      }
    }

    if (count > 0) {
      result.push(count);
    }

    return result;
  }

  for (let i = 0; i < size; i++) {
    const rowClues = countConsecutiveOnes(matrix[i]);
    maxLengthRows = Math.max(maxLengthRows, rowClues.length);
    arrayCluesRows.push(rowClues);
  }

  for (let col = 0; col < size; col++) {
    const colArray = [];
    for (let row = 0; row < size; row++) {
      colArray.push(matrix[row][col]);
    }
    const colClues = countConsecutiveOnes(colArray);
    maxLengthCols = Math.max(maxLengthCols, colClues.length);
    arrayCluesCols.push(colClues);
  }

  function alignArray(arr, maxLength) {
    return arr.map((clue) => {
      const prefix = Array(maxLength - clue.length).fill(0);
      return prefix.concat(clue);
    });
  }

  const alignedArrayCluesRows = alignArray(arrayCluesRows, maxLengthRows);

  const alignedArrayCluesCols = alignArray(arrayCluesCols, maxLengthCols);

  const rotateArrayCluesCols = [];

  for (let col = 0; col < maxLengthCols; col++) {
    const colArray = [];
    for (let row = 0; row < size; row++) {
      colArray.push(alignedArrayCluesCols[row][col]);
    }
    rotateArrayCluesCols.push(colArray);
  }

  return {
    maxLengthRows,
    maxLengthCols,
    rows: alignedArrayCluesRows,
    cols: rotateArrayCluesCols,
  };
}

// let result = calculateClues(template);
// console.log('Rows:', result.rows);
// console.log('Columns:', result.cols);

// Создание панелей ключей

const leftClues = document.querySelector('.left-clues');
const topClues = document.querySelector('.top-clues');

function createCluesPanel(arr, element) {
  element.style.gridTemplateColumns = `repeat(${arr[0].length}, ${sizeCells}px)`;

  for (let row = 0; row < arr.length; row += 1) {
    for (let col = 0; col < arr[row].length; col += 1) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.style.cssText = `
      width: ${sizeCells}px;
      height: ${sizeCells}px;`;
      cell.setAttribute('data-cell', `${row} ${col}`);
      cell.innerText = arr[row][col] ? `${arr[row][col]}` : '';
      element.append(cell);
    }
  }
}
createCluesPanel(calculateClues(template).rows, leftClues);
createCluesPanel(calculateClues(template).cols, topClues);

// Разделение панелей красной сеткой

function splitMatrix(selector, orientation) {
  const cellsCollection = document.querySelectorAll(
    `${selector} > [data-cell]`
  );
  let width = 0;
  let height = 0;

  cellsCollection.forEach((el) => {
    width = Math.max(el.dataset.cell.split(' ')[1], width);
    height = Math.max(el.dataset.cell.split(' ')[0], height);
  });

  // Убрал крайние бордеры

  function setBorderStyle(elements, style, value) {
    elements.forEach((el) => {
      el.style[style] = value;
    });
  }

  const top = document.querySelectorAll(`${selector} > [data-cell^="0 "]`);
  const right = document.querySelectorAll(
    `${selector} > [data-cell$=" ${width}"]`
  );
  const bottom = document.querySelectorAll(
    `${selector} > [data-cell^="${height} "]`
  );
  const left = document.querySelectorAll(`${selector} > [data-cell$=" 0"]`);

  setBorderStyle(top, 'borderTop', 'none');
  setBorderStyle(right, 'borderRight', 'none');
  setBorderStyle(bottom, 'borderBottom', 'none');
  setBorderStyle(left, 'borderLeft', 'none');

  // Разбиение полей на квадраты

  const firstLine = [4, 5];
  const step = 5;

  if (orientation === 'both' || orientation === 'cols') {
    for (let i = firstLine[0]; i < width; i += step) {
      const cell = document.querySelectorAll(
        `${selector} > [data-cell$=" ${i}"]`
      );
      setBorderStyle(cell, 'borderRight', '1.5px solid #313195');
    }
    for (let i = firstLine[1]; i < width; i += step) {
      const cell = document.querySelectorAll(
        `${selector} > [data-cell$=" ${i}"]`
      );
      setBorderStyle(cell, 'borderLeft', '1.5px solid #313195');
    }
  }

  if (orientation === 'both' || orientation === 'rows') {
    for (let i = firstLine[0]; i < height; i += step) {
      const cell = document.querySelectorAll(
        `${selector} > [data-cell^="${i}"]`
      );
      setBorderStyle(cell, 'borderBottom', '1.5px solid #313195');
    }
    for (let i = firstLine[1]; i < height; i += step) {
      const cell = document.querySelectorAll(
        `${selector} > [data-cell^="${i}"]`
      );
      setBorderStyle(cell, 'borderTop', '1.5px solid #313195');
    }
  }
}

splitMatrix('.top-clues', 'cols');
splitMatrix('.left-clues', 'rows');
splitMatrix('.crossword', 'both');

const modal = document.querySelector('.modal');

function gameOver() {
  setTimeout(() => {
    const modalImg = modal.querySelector('.modal__img');
    const modalResult = modal.querySelector('.modal__result');

    modalImg.src = './img/win.gif';
    modalResult.innerText = 'You Win!';

    modal.classList.add('show');
  }, 300);
}

// Сравнить матрицы

function areArraysEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    console.log(false);
    return false;
  }

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i].length !== arr2[i].length) {
      console.log(false);

      return false;
    }

    for (let j = 0; j < arr1[i].length; j++) {
      if (arr1[i][j] !== arr2[i][j]) {
        console.log(false);

        return false;
      }
    }
  }

  console.log(true);
  gameOver();
  // template = getRandomPicture(document.querySelector('input:checked').id);
}

function addListenerForCells() {
  const cells = crossword.querySelectorAll('.cell');

  crossword.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    cells.forEach((cell) => {
      if (e.target === cell) {
        cell.classList.toggle('mark');
        cell.classList.remove('filled');
        const [x, y] = cell.dataset.cell.split(' ');
        curMatrix[x][y] = 0;

        areArraysEqual(curMatrix, template);
      }
    });
  });

  crossword.addEventListener('click', (e) => {
    cells.forEach((cell) => {
      if (e.target === cell) {
        cell.classList.toggle('filled');
        const [x, y] = cell.dataset.cell.split(' ');
        cell.classList.remove('mark');
        if (!cell.classList.contains('filled')) {
          curMatrix[x][y] = 0;
        } else {
          curMatrix[x][y] = 1;
        }

        areArraysEqual(curMatrix, template);
      }
    });
  });
}

addListenerForCells();

const startBtn = document.querySelector('.modal__start');
startBtn.addEventListener('click', () => {
  crossword.innerHTML = '';
  leftClues.innerHTML = '';
  topClues.innerHTML = '';
  curMatrix = createCrossword(size, 30);
  template = getRandomPicture(chooseComplexity);
  createCluesPanel(calculateClues(template).rows, leftClues);
  createCluesPanel(calculateClues(template).cols, topClues);
  splitMatrix('.top-clues', 'cols');
  splitMatrix('.left-clues', 'rows');
  splitMatrix('.crossword', 'both');
  addListenerForCells();
  addPictureSection(chooseComplexity);
  choosePicture();
  modal.classList.remove('show');
});

const complexites = Object.entries(templates);
const complexityBox = document.querySelector('.complexites');
let sizeCrossword = 5;
complexites.forEach((el, i) => {
  const textRadio =
    i === 0
      ? `<input type="radio" name="complexity" class="complexites__radio" value="#0000ff" id="${el[0]}" checked />`
      : `<input type="radio" name="complexity" class="complexites__radio" value="#0000ff" id="${el[0]}"/>`;

  complexityBox.insertAdjacentHTML(
    'beforeend',
    `${textRadio}
    <label for="${el[0]}" class="complexites__radio-label ${el[0]}" data-size="${sizeCrossword}">${el[0]}</label>`
  );
  sizeCrossword += 5;
});

function addPictureSection(complexity) {
  const picturesBox = document.querySelector('.pictures');
  picturesBox.innerHTML = '';
  const pictures = Object.entries(templates[complexity]);
  pictures.forEach((el) => {
    const text =
      el[1] === template
        ? `<input type="radio" name="picture" class="pictures__picture" id="${el[0]}"  checked />`
        : `<input type="radio" name="picture" class="pictures__picture" id="${el[0]}" />`;

    picturesBox.insertAdjacentHTML(
      'beforeend',
      `${text}
      <label for="${el[0]}" class="pictures__picture-label">${el[0]}</label>`
    );
  });
}

addPictureSection(chooseComplexity);

function choosePicture() {
  const pictures = document.querySelectorAll('.pictures__picture-label');
  pictures.forEach((picture) => {
    picture.addEventListener('click', () => {
      crossword.innerHTML = '';
      topClues.innerHTML = '';
      leftClues.innerHTML = '';
      template = templates[chooseComplexity][picture.innerText];
      console.log(template);
      curMatrix = createCrossword(size, 30);
      createCluesPanel(calculateClues(template).rows, leftClues);
      createCluesPanel(calculateClues(template).cols, topClues);
      splitMatrix('.top-clues', 'cols');
      splitMatrix('.left-clues', 'rows');
      splitMatrix('.crossword', 'both');
      addListenerForCells();
    });
  });
}

choosePicture();

const complexityInputs = document.querySelectorAll('.complexites__radio-label');
complexityInputs.forEach((el, i) => {
  el.addEventListener('click', () => {
    const radioInputs = document.querySelectorAll('.complexites__radio');
    if (!radioInputs[i].checked) {
      size = +el.dataset.size;
      crossword.innerHTML = '';
      topClues.innerHTML = '';
      leftClues.innerHTML = '';
      chooseComplexity = el.innerText;
      template = getRandomPicture(chooseComplexity);
      curMatrix = createCrossword(size, 30);
      createCluesPanel(calculateClues(template).rows, leftClues);
      createCluesPanel(calculateClues(template).cols, topClues);
      splitMatrix('.top-clues', 'cols');
      splitMatrix('.left-clues', 'rows');
      splitMatrix('.crossword', 'both');
      addListenerForCells();
      addPictureSection(chooseComplexity);
      choosePicture();
    }
  });
});

const resetBtn = document.querySelector('.restart');

resetBtn.addEventListener('click', () => {
  const cells = crossword.querySelectorAll('.cell');
  cells.forEach((cell) => {
    cell.classList.remove('filled');
  });
  for (let i = 0; i < size; i += 1) {
    for (let j = 0; j < size; j += 1) {
      curMatrix[i][j] = 0;
    }
  }
});

function handleRightClick(event) {
  // Предотвращаем стандартное контекстное меню
  event.preventDefault();

  // Ваш код для выполнения при нажатии правой кнопки мыши

  // Добавьте свою логику здесь
}
