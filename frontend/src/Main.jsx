import React from 'react';
import {
  Group, Panel, PanelHeader, SimpleCell,
} from '@vkontakte/vkui';
import {
  Match, View, Root,
} from '@unexp/router';

// const Main = () => (
//   <Match>
//     <Root>
//       <View nav="/">
//         <Panel nav="/">
//           <PanelHeader>Main</PanelHeader>
//           <Group>
//             <SimpleCell>Kitty</SimpleCell>
//             <SimpleCell>World</SimpleCell>
//           </Group>
//         </Panel>
//         <Panel nav="/kitty">
//           <PanelHeader>Kitty</PanelHeader>
//           <Group>
//             <SimpleCell>Kitty</SimpleCell>
//             <SimpleCell>World</SimpleCell>
//           </Group>
//         </Panel>
//         <Panel nav="/world">
//           <PanelHeader>World</PanelHeader>
//           <Group>
//             <SimpleCell>Hello</SimpleCell>
//             <SimpleCell>World</SimpleCell>
//           </Group>
//         </Panel>
//       </View>
//     </Root>
//   </Match>
// );

const Main = () => (
  <Match>
    <Root>
      <View nav="/">
        <Panel nav="/">
          <PanelHeader>Main</PanelHeader>
          <Group>
            <SimpleCell>Kitty</SimpleCell>
            <SimpleCell>World</SimpleCell>
          </Group>
        </Panel>
      </View>
      <View nav="/kitty">
        <Panel nav="/">
          <PanelHeader>Kitty</PanelHeader>
          <Group>
            <SimpleCell>Hello</SimpleCell>
            <SimpleCell>Kitty</SimpleCell>
          </Group>
        </Panel>
      </View>
      <View nav="/world">
        <Panel nav="/">
          <PanelHeader>World</PanelHeader>
          <Group>
            <SimpleCell>Hello</SimpleCell>
            <SimpleCell>World</SimpleCell>
          </Group>
        </Panel>
      </View>
    </Root>
  </Match>
);

export default Main;
