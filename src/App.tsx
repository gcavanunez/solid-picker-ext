import { Component, createSignal, For, JSX, onMount } from 'solid-js';

import { createEffect } from 'solid-js';
import { createStore, SetStoreFunction, Store } from 'solid-js/store';

export function createLocalStore<T extends object>(
  name: string,
  init: T
): [Store<T>, SetStoreFunction<T>] {
  const localState = localStorage.getItem(name);
  const [state, setState] = createStore<T>(
    localState ? JSON.parse(localState) : init
  );
  createEffect(() => localStorage.setItem(name, JSON.stringify(state)));
  return [state, setState];
}

export function removeIndex<T>(array: readonly T[], index: number): T[] {
  return [...array.slice(0, index), ...array.slice(index + 1)];
}

function componentToHex(c: number) {
  var hex = c.toString(16);
  return hex.length == 1 ? '0' + hex : hex;
}

function rgbToHex(r: number, g: number, b: number) {
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

type SavedColor = {
  rgb: string;
  hex: string;
};

const PickedColor: Component<{
  color: SavedColor;
  children?: JSX.Element;
}> = (props) => {
  return (
    <>
      <div class=" flex items-center space-x-2 mt-3">
        <div
          class="h-10 w-10 shadow "
          style={{ 'background-color': props.color.hex }}
        />
        <div>
          <input
            readOnly
            value={props.color.hex}
            class="text-xs py-2"
            type="text"
          />
        </div>
        {props.children}
      </div>
    </>
  );
};

const App: Component = () => {
  const [color, setColor] = createSignal<SavedColor>({ hex: '', rgb: '' });

  const [colors, setColors] = createLocalStore<SavedColor[]>(
    'solid-colors',
    []
  );

  //@ts-ignore
  const eyeDropper = new EyeDropper();

  const trigger = () => {
    eyeDropper
      .open()
      .then((result: { sRGBHex: string }) => {
        const withoutFirstAndLast = result.sRGBHex
          .replace('rgb', '')
          .slice(1, -1);
        const [r, g, b] = withoutFirstAndLast.split(',').map((row) => +row);
        const hex = rgbToHex(r, g, b);

        setColor(() => {
          return {
            hex,
            rgb: result.sRGBHex,
          };
        });
      })
      .catch(() => {
        // setColor();
      });
  };

  const saveColor = () => {
    setColors(colors.length, {
      rgb: color().rgb,
      hex: color().hex,
    });
  };
  const removeColor = (i: number) => {
    setColors((t) => removeIndex(t, i));
  };
  return (
    <div class="bg-gray-200 min-h-[20rem] min-w-[15rem]">
      <header></header>
      <main class="px-4 py-2 divide-y divide-gray-300">
        <div class="pb-4">
          <button
            class=" p-2 rounded-lg shadow-2xl bg-blue-500"
            onClick={trigger}
          >
            Eye Drop
          </button>
          <PickedColor color={color()}>
            <button class="" onClick={saveColor}>
              Save
            </button>
          </PickedColor>
        </div>
        <ul class="pt-4">
          {/*  fallback={<div>Loading...</div>} */}
          <For each={colors}>
            {(item, i) => (
              <PickedColor color={item}>
                <button class="" onClick={() => removeColor(i())}>
                  Remove
                </button>
              </PickedColor>
            )}
          </For>
        </ul>
      </main>
    </div>
  );
};

export default App;
