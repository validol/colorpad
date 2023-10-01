const glass = document.getElementById('glass');
const clear = document.getElementById('clear');
const showClearModal = document.getElementById('show-clear-modal');
const box = document.getElementById('box');
const copy = document.getElementById('copy');
const copyAsObject = document.getElementById('copy-object');
const copyAsArray = document.getElementById('copy-array');
const dummy = document.getElementById('dummy');
const dummyColor = dummy.children[0];
const notification = document.querySelector('.notif');

const state = {
  colors: [],
  copyas: 'none',
  menu: 'settings',
  set color(data) {
    if (Array.isArray(data) && data.length) {
      this.colors = data;
    }
    if (typeof data === 'string' && !Array.isArray(data)) {
      this.colors.unshift(data);
      this.picked(data);
    }
    if (Array.isArray(data) && !data.length) {
      this.colors = [];
      this.clear();
    }
  },
  get color() {
    return this.colors;
  },
  picked: function (colorItem) {
    chrome.runtime.sendMessage({ picked: colorItem });
  },
  removed: function (colorItem) {
    chrome.runtime.sendMessage({ removed: colorItem });
  },
  sorted: function (colorItems) {
    chrome.runtime.sendMessage({ sorted: colorItems });
  },
  clear: function () {
    chrome.runtime.sendMessage({ clear: true });
  },
  set copy(data) {
    this.copyas = data;
    chrome.storage.local.set({ copyas: data });
  },
  get copy() {
    return this.copyas;
  }
};

function initColors() {
  chrome.storage.local.get()
    .then((result) => {

      Object.keys(result).forEach(item => {
        state[item] = result[item];
      });

      result.colors.forEach((color, index) => {
        addNewColorItem({ color: color, index: index + 1 });
      });

      if (result.copyas === 'array') {
        copyAsArray.checked = true;
      }
      if (result.copyas === 'object') {
        copyAsObject.checked = true;
      }
    });
}


function handleEye() {
  const hasSupport = () => ('EyeDropper' in window);
  let eyeDropper = null;

  if (hasSupport) {
    eyeDropper = new window.EyeDropper();
  } else {
    console.warn('No Support: This browser does not support the EyeDropper API yet!');
  }

  if (eyeDropper) {
    eyeDropper.open()
      .then(result => {
        const color = result.sRGBHex;
        const includes = state.color.includes(color);

        if (!includes) {
          state.color = color;
          addNewColorItem({ color: color, type: 'prepend' });
        }
      })
      .catch(e => console.log(e));
  }
}

glass.onclick = function (e) {
  e.stopPropagation();
  e.preventDefault();
  handleEye();
};

showClearModal.onclick = function (e) {
  e.preventDefault();

  if (box.hasChildNodes()) {
    UIkit.modal('#clear-modal').show();
    document.documentElement.removeAttribute('style');
    document.documentElement.removeAttribute('class');
  } else {
    flashNotification("Nothing to remove");
  }
}

clear.onclick = function (e) {
  e.preventDefault();

  while (box.firstChild) {
    box.removeChild(box.firstChild);
  }

  state.color = [];

  UIkit.modal('#clear-modal').hide();
}

copy.onclick = function(e) {
  e.stopPropagation();
  e.preventDefault();

  if (state.color.length) {
    let copyAs = state.copy;
    let copyColors = '';
    

    if (copyAs === 'array') {
      copyColors = '[\n' + state.color.map(color => `\t"${color}",\n`).join(' ') + ']';
    }

    if (copyAs === 'object') {
      copyColors = '{\n' + state.color.map(color => `\t"${color.replace('#', '')}": "${color}",\n`).join(' ') + '}';
    }

    try {
      navigator.clipboard.writeText(copyColors);
      flashNotification("Copied to clipboard");
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  } else {
    flashNotification("Nothing to copy");
  }
}

copyAsArray.onchange = function (e) {
  state.copy = 'array';
  UIkit.dropdown('.dropdown').hide();
}

copyAsObject.onchange = function (e) {
  state.copy = 'object';
  UIkit.dropdown('.dropdown').hide();
}

function addNewColorItem({ color, type, index = 1 }) {
  let newColor = dummyColor.cloneNode(true);

  const colorEl = newColor.children[0];
  const colorHex = newColor.children[1];
  const colorRemove = newColor.children[2];

  colorHex.onclick = copyHexCode;
  colorRemove.onclick = removeColorItem;

  colorEl.style.backgroundColor = color;
  colorHex.textContent = color;

  const div = document.createElement('div');
  div.appendChild(newColor);
  if (type === 'prepend') {
    box.prepend(div);
  } else {
    box.appendChild(div);
  }
}

function removeColorItem(e) {
  e.stopPropagation();
  e.preventDefault();

  const colorItem = e.currentTarget.parentNode;
  colorItem.style.transform = "translateX(300px)";

  colorItem.ontransitionend = () => {
    box.removeChild(colorItem.parentNode);

    const colorHex = colorItem.querySelector('.color-hex ').textContent;
    state.color = state.color.filter(color => color !== colorHex);

    state.removed(colorHex);
  };
};

async function copyHexCode(e) {
  e.stopPropagation();
  e.preventDefault();

  try {
    await navigator.clipboard.writeText(e.currentTarget.innerText.toLowerCase());
    flashNotification("Copied to clipboard");
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
}

function flashNotification(message) {
  notification.style.display = 'flex';
  notification.children[0].innerText = message;
  setTimeout(() => {
    notification.style.display = 'none';
  }, 1000);
}

UIkit.util.on('#box', 'stop', function (e) {
  let orderedColors = [];
  const colorItems = box.querySelectorAll('.color-item');
  colorItems.forEach(item => {
    orderedColors.push(item.querySelector('.color-hex').textContent);
  });
  state.color = orderedColors;

  state.sorted(orderedColors);
});

initColors();
